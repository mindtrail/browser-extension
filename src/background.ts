// import manualModeIcon from 'data-base64:~assets/icon-disabled.png'
import autoModeIcon from 'url:~assets/icon.development-32.png'
import manualModeIcon from 'url:~assets/manual-32.png'

import { Storage } from '@plasmohq/storage'

import { MESSAGES, DEFAULT_EXTENSION_SETTINGS, STORAGE_KEY } from '~/lib/constants'
import { log } from '~/lib/utils'
import * as api from '~/lib/api'

type SendResponse = (resp: any) => void

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
          break
        case MESSAGES.DELETE_CLIPPING:
          await deleteClipping(payload, sendResponse)
          break
        case MESSAGES.SEARCH_HISTORY:
          await searchHistory(payload, sendResponse)
          break
        case MESSAGES.UPDATE_ICON:
          await updateExtensionIcon()
          break
        case MESSAGES.GET_CLIPPING_LIST:
          await fetchClippingList(sendResponse)
          break
        default:
          break
      }
    } catch (error) {
      console.error('Error ::: ', error)

      const { cause } = error || {}
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

  const updatedList = await fetchClippingList()
  console.log(updatedList)

  sendResponse({ clipping: newClipping, updatedList })
}

async function deleteClipping({ clippingId }, sendResponse: SendResponse) {
  const deletedClipping = await api.deleteClippingAPICall(clippingId)
  log('deleted Clipping', deletedClipping)

  const updatedList = await fetchClippingList()
  sendResponse({ clipping: deletedClipping, updatedList })
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
  // @TODO: handle error when fetching data, in the client
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
