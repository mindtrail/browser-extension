import { Storage } from '@plasmohq/storage'

import { updateExtensionIcon } from '~background/utils/update-icon'
import * as api from '~background/lib/api'
import { log } from '~lib/utils'
import { MESSAGES, STORAGE_AREA } from '~/lib/constants'

import { initializeExtension } from './utils/initialize'
import { listenForNavigationEvents } from './utils/nav-events'
import { getStorage } from '../lib/storage'

let storage: Storage

// Ensure listeners are added when the extension is installed or updated
chrome.runtime.onInstalled.addListener(async () => {
  initializeExtension()
  listenForNavigationEvents()
  storage = await getStorage()
})

chrome.runtime.onMessage.addListener(
  async (request, _sender, sendResponse: ContentScriptResponse) => {
    await processMessage(request, sendResponse)
    return true
  },
)

async function savePage(payload: PageData, sendResponse: ContentScriptResponse) {
  const response = await api.savePageAPICall(payload)
  sendResponse(response)
}

interface searchPayload {
  searchQuery: string
}
async function searchHistory(
  { searchQuery }: searchPayload,
  sendResponse: ContentScriptResponse,
) {
  const websites = await api.searchHistoryAPICall(searchQuery)

  log(websites)
  sendResponse(websites)
}

async function fetchSavedDSList() {
  const savedDsList = await api.fetchSavedDSListAPICall()
  await storage.set(STORAGE_AREA.SAVED_WEBSITES, savedDsList)
}

async function processMessage(request: any, sendResponse: ContentScriptResponse) {
  const { message, payload } = request

  switch (message) {
    case MESSAGES.SAVE_PAGE:
      await savePage(payload, sendResponse)
      fetchSavedDSList() // Update storage data after a new page added
      break
    // case MESSAGES.SAVE_CLIPPING:
    //   await saveClipping(payload, sendResponse)
    //   // fetchClippingList() // Update storage data afeter a new item added
    //   fetchSavedDSList() // Update storage data after a new page added
    //   break
    // case MESSAGES.DELETE_CLIPPING:
    //   await deleteClipping(payload, sendResponse)
    //   // fetchClippingList() // Update storage data after a delete
    //   break
    case MESSAGES.SEARCH_HISTORY:
      await searchHistory(payload, sendResponse)
      break
    case MESSAGES.UPDATE_ICON:
      await updateExtensionIcon()
      break
    case 'START_RECORDING':
      // startRecording(payload)
      break
    case 'STOP_RECORDING':
      // stopRecording()
      break
    default:
      break
  }
}
