import { Storage } from '@plasmohq/storage'

import { updateExtensionIcon } from '~/background/utils/update-icon'
import * as api from '~/background/lib/api'
import { log } from '~/lib/utils'
import { MESSAGES } from '~/lib/constants'

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

async function processMessage(request: any, sendResponse: ContentScriptResponse) {
  const { message, payload } = request

  switch (message) {
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
