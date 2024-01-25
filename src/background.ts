// import manualModeIcon from 'data-base64:~assets/icon-disabled.png'
import autoModeIcon from 'url:~assets/icon.development-32.png'
import manualModeIcon from 'url:~assets/manual-32.png'

import { Storage } from '@plasmohq/storage'

import { MESSAGES, HOST, API, DEFAULT_EXTENSION_SETTINGS } from '~/lib/constants'
import { log } from '~/lib/utils'
import * as api from '~/lib/api'

const NODE_ENV = process.env.NODE_ENV
const IS_DEV = NODE_ENV === 'development'
const TARGET_HOST = IS_DEV ? HOST.LOCAL : HOST.REMOTE

type SendResponse = (resp: any) => void

chrome.runtime.onMessage.addListener((request, sender, sendResponse: SendResponse) => {
  const { message, payload } = request

  log(
    sender.tab
      ? 'From Content script:' + sender.tab.url + message
      : 'From Extension' + message,
  )

  try {
    switch (message) {
      case MESSAGES.SAVE_PAGE:
        savePage(payload, sendResponse)
        break
      case MESSAGES.SAVE_CLIPPING:
        saveClipping(payload, sendResponse)
        break
      case MESSAGES.DELETE_CLIPPING:
        deleteClipping(payload, sendResponse)
        break
      case MESSAGES.SEARCH_HISTORY:
        searchHistory(payload, sendResponse)
        break
      case MESSAGES.UPDATE_ICON:
        updateExtensionIcon()
        break
      case MESSAGES.GET_CLIPPING_LIST:
        fetchClippingList(sendResponse)
        break
      default:
        break
    }
  } catch (e) {
    console.error('Error ::: ', e)
    sendResponse({ error: e })
  }

  // Return true keeps the connection allive with the content script
  return true
})

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
  try {
    const deletedClipping = await api.deleteClippingAPICall(clippingId)
    log('deleted Clipping', deletedClipping)

    const updatedList = await fetchClippingList()
    sendResponse({ clipping: deletedClipping, updatedList })
  } catch (e) {
    console.error(e)
  }
}

interface searchPayload {
  searchQuery: string
}
async function searchHistory({ searchQuery }: searchPayload, sendResponse: SendResponse) {
  const result = await fetch(
    `${TARGET_HOST + API.SEARCH_HISTORY}?searchQuery=${searchQuery}`,
  )

  const websites = await result.json()
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
  console.log(NODE_ENV)

  storage = new Storage()

  const settings = (await storage.get('settings')) as SettingsStored
  if (!settings) {
    await storage.set('settings', DEFAULT_EXTENSION_SETTINGS)
  }

  updateExtensionIcon()
  // @TODO: handle error when fetching data, in the client
  fetchClippingList()
}

async function getAutoSaveStatus() {
  const settings = (await storage.get('settings')) as SettingsStored
  return settings?.autoSave
}

async function fetchClippingList(sendResponse?: SendResponse) {
  try {
    const result = await fetch(TARGET_HOST + API.CLIPPING, {
      credentials: 'include', // Include cookies for cross-origin requests
    })
    const { ok, status } = result

    if (!ok) {
      console.log(status)
      throw new Error(status.toString())
    }
    const clippingList = await result.json()
    const response = await storage.set('clippingList', clippingList)

    if (sendResponse) {
      sendResponse(response)
    }

    return response
  } catch (e) {
    console.log('error Clippings', e)
    return []
  }
}

initializeExtension()
