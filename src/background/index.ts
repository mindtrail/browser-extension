// import manualModeIcon from 'data-base64:~assets/icon-disabled.png'
import autoModeIcon from 'url:~assets/icon.development-32.png'
import savedIcon from 'url:~assets/saved-32.png'
// import manualModeIcon from 'url:~assets/manual-32.png'

import { Storage } from '@plasmohq/storage'

import { API, MESSAGES, DEFAULT_EXTENSION_SETTINGS, STORAGE_KEY } from '~/lib/constants'
import { log } from '~/lib/utils'
import * as api from '~/lib/api'

type SendResponse = (resp: any) => void

chrome.runtime.onMessage.addListener(
  async (request, _sender, sendResponse: SendResponse) => {
    try {
      await processMessage(request, sendResponse)
    } catch (error) {
      const { cause } = error || {}
      console.error('Error :::', cause)

      if (parseInt(cause?.status) === 401) {
        setTimeout(async () => {
          console.log(request, cause)
          await authenticateAndRetry(request, sendResponse)
        }, 1000)
        return
      }

      const resultError = cause || { message: 'Unknown error' }
      log('resultError', resultError)

      sendResponse({ error: resultError })
    }

    // Return true keeps the connection allive with the content script
    return true
  },
)

async function savePage(payload: PageData, sendResponse: SendResponse) {
  const response = await api.savePageAPICall(payload)
  sendResponse(response)
}

async function saveClipping(payload: SavedClipping, sendResponse: SendResponse) {
  const { pageData, ...rest } = payload

  const { dataSource } = await api.savePageAPICall(pageData)
  log('dataSource', dataSource)

  if (!dataSource) {
    throw new Error('No dataSource', { cause: { error: 'No dataSource' } })
  }

  const saveClippingPayload = {
    ...rest,
    dataSourceId: dataSource.id,
  }

  console.log('payload', saveClippingPayload)

  const newClipping = await api.saveClippingAPICall(saveClippingPayload)
  console.log('newClipping', newClipping)

  sendResponse(newClipping)
}

async function deleteClipping({ clippingId }, sendResponse: SendResponse) {
  const deletedClipping = await api.deleteClippingAPICall(clippingId)

  log('deleted Clipping', deletedClipping)
  sendResponse(deletedClipping)
}

interface searchPayload {
  searchQuery: string
}
async function searchHistory({ searchQuery }: searchPayload, sendResponse: SendResponse) {
  const websites = await api.searchHistoryAPICall(searchQuery)

  log(websites)
  sendResponse(websites)
}

// Based on Auto/Manual save, update the extension icon
async function updateExtensionIcon() {
  const autoSave = await getAutoSaveStatus()

  chrome?.action?.setIcon({
    path: autoSave ? autoModeIcon : savedIcon,
  })

  log('autoSave update --- :', autoSave)
}

let storage: Storage

async function initializeExtension() {
  storage = new Storage({ area: 'local' })

  const settings = (await storage.get(STORAGE_KEY.SETTINGS)) as SettingsStored
  if (!settings) {
    await storage.set(STORAGE_KEY.SETTINGS, DEFAULT_EXTENSION_SETTINGS)
  }

  updateExtensionIcon()
  fetchClippingList()
  getSavedDSList()
}

async function getAutoSaveStatus() {
  const settings = (await storage.get(STORAGE_KEY.SETTINGS)) as SettingsStored
  return settings?.autoSave
}

async function fetchClippingList(sendResponse?: SendResponse) {
  try {
    const clippingList = await api.getClippingListAPICall()

    const clippingsMap = clippingList.reduce((acc: any, item: ClippingByDataSource) => {
      acc[item.dataSourceName] = item.clippingList
      return acc
    }, {})

    await storage.set(STORAGE_KEY.CLIPPINGS_BY_DS, clippingsMap)

    if (sendResponse) {
      sendResponse(clippingList)
    }

    return clippingList
  } catch (error) {
    console.error('error Clippings', error, error?.cause)
    return []
  }
}

async function getSavedDSList() {
  const savedDsList = await api.getSavedDSListAPICall()
  await storage.set(STORAGE_KEY.SAVED_WEBSITES, savedDsList)
}

initializeExtension()

async function authenticateAndRetry(request: any, sendResponse: SendResponse) {
  try {
    let loginWindow = null
    let loginTabId = null

    // Open the login window
    chrome.windows.create(
      {
        url: `${api.TARGET_HOST}${API.SIGN_IN}?callbackUrl=${API.SUCCESS_LOGIN}`,
        type: 'popup',
        width: 800,
        height: 600,
        top: 100,
        left: 200,
      },
      (newWindow) => {
        loginWindow = newWindow
        loginTabId = newWindow?.tabs[0]?.id
      },
    )

    const onTabUpdate = async function (
      tabId: number,
      changeInfo: any,
      tab: chrome.tabs.Tab,
    ) {
      if (tabId !== loginTabId) {
        return // Ignore updates from tabs not in the login window
      }

      const url = changeInfo?.url || ''
      // Only some updates inlcude the url, like load, we only listen to those
      if (!url) {
        return
      }

      const isSuccessLogin =
        url?.includes(`${API.SUCCESS_LOGIN}`) && !url?.includes(API.SIGN_IN)

      if (isSuccessLogin) {
        initializeExtension()
        processMessage(request, sendResponse)

        chrome.tabs.onUpdated.removeListener(onTabUpdate)
        chrome.windows.onRemoved.removeListener(onWindowClose)
        chrome.windows.remove(loginWindow.id)
      }
    }

    const onWindowClose = function (closedWindowId: number) {
      if (closedWindowId === loginWindow.id) {
        // Reset the loginWindow.Id
        loginWindow = null
        sendResponse({
          error: { message: 'Login unsuccessful. Window closed', status: 401 },
        })

        // Remove the listeners
        chrome.tabs.onUpdated.removeListener(onTabUpdate)
        chrome.windows.onRemoved.removeListener(onWindowClose)
      }
    }

    chrome.windows.onRemoved.addListener(onWindowClose)

    chrome.tabs.onUpdated.addListener(onTabUpdate)
  } catch (error) {
    console.error('Auth error :::', error)
  }
}

async function processMessage(request: any, sendResponse: SendResponse) {
  const { message, payload } = request

  switch (message) {
    case MESSAGES.SAVE_PAGE:
      await savePage(payload, sendResponse)
      getSavedDSList() // Update storage data after a new page added
      break
    case MESSAGES.SAVE_CLIPPING:
      await saveClipping(payload, sendResponse)
      fetchClippingList() // Update storage data afeter a new item added
      getSavedDSList() // Update storage data after a new page added
      break
    case MESSAGES.DELETE_CLIPPING:
      await deleteClipping(payload, sendResponse)
      fetchClippingList() // Update storage data after a delete
      break
    case MESSAGES.SEARCH_HISTORY:
      await searchHistory(payload, sendResponse)
      break
    case MESSAGES.UPDATE_ICON:
      await updateExtensionIcon()
      break
    default:
      break
  }
}
