// import manualModeIcon from 'data-base64:~assets/icon-disabled.png'
import autoModeIcon from 'url:~assets/icon.development-32.png'
import manualModeIcon from 'url:~assets/manual-32.png'

import { Storage } from '@plasmohq/storage'

import { API, MESSAGES, DEFAULT_EXTENSION_SETTINGS, STORAGE_KEY } from '~/lib/constants'
import { log } from '~/lib/utils'
import * as api from '~/lib/api'

type SendResponse = (resp: any) => void

let previousTabId = null
let previousTabUrl = null

chrome.runtime.onMessage.addListener(
  async (request, sender, sendResponse: SendResponse) => {
    const { message, payload } = request

    log(
      sender.tab
        ? 'From Content script:' + sender.tab.url + message
        : 'From Extension' + message,
    )

    try {
      switch (message) {
        case MESSAGES.SAVE_PAGE:
          await savePage(payload, sendResponse)
          break
        case MESSAGES.SAVE_CLIPPING:
          await saveClipping(payload, sendResponse)
          fetchClippingList() // Update storage data afeter a new item added
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
    } catch (error) {
      console.error('Error ::: ', error)

      const { cause } = error || {}
      console.error('cause', cause)

      if (parseInt(cause?.status) === 401) {
        setTimeout(() => {
          // Store the tab ID to return to after login)
          previousTabId = sender.tab.id // Store the tab ID to return to after login
          previousTabUrl = sender.tab.url // Store the tab URL

          redirectToAuth()
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

  const newClipping = await api.saveClippingAPICall(saveClippingPayload)
  log('newClipping', newClipping)
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
    path: autoSave ? autoModeIcon : manualModeIcon,
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
}

async function getAutoSaveStatus() {
  const settings = (await storage.get(STORAGE_KEY.SETTINGS)) as SettingsStored
  return settings?.autoSave
}

async function fetchClippingList(sendResponse?: SendResponse) {
  try {
    const clippingList = await api.getClippingListAPICall()
    console.log('clipping grouped by dataSource', clippingList)

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

initializeExtension()

async function redirectToAuth() {
  const loginTab = await chrome.tabs.create({
    url: `${api.TARGET_HOST}${API.SIGN_IN}?callbackUrl=${API.SUCCESS_LOGIN}`,
  })

  // Define the listener inside redirectToAuth to capture loginTab in the closure
  const onTabUpdate = function (tabId: number, changeInfo: any) {
    const url = changeInfo?.url || ''
    // Only some updates inlcude the url, like load, we only listen to those
    if (!url || tabId === loginTab.id) {
      return
    }

    const isSuccessLogin =
      url?.includes(`${API.SUCCESS_LOGIN}`) && !url?.includes(API.SIGN_IN)

    if (isSuccessLogin) {
      if (previousTabId) {
        chrome.tabs.update(previousTabId, { url: previousTabUrl })
        chrome.tabs.remove(loginTab.id)
      }

      initializeExtension()
      chrome.tabs.onUpdated.removeListener(onTabUpdate)
    }
  }

  chrome.tabs.onUpdated.addListener(onTabUpdate)
}
