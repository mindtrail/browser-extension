// import manualModeIcon from 'data-base64:~assets/icon-disabled.png'
import autoModeIcon from 'url:~assets/icon.development-32.png'
import manualModeIcon from 'url:~assets/manual-32.png'

import { Storage } from '@plasmohq/storage'

import { MESSAGES, HOST, API, DEFAULT_EXTENSION_SETTINGS } from '~/lib/constants'
import { log } from '~/lib/utils'

const TEST_USER = 'clnj8rr9r00009krsmk10j07o'

const NODE_ENV = process.env.NODE_ENV
const IS_DEV = NODE_ENV === 'development'
const TARGET_HOST = IS_DEV ? HOST.LOCAL : HOST.REMOTE

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { message, payload } = request

  log(
    sender.tab
      ? 'From Content script:' + sender.tab.url + message
      : 'From Extension' + message,
  )

  switch (message) {
    case MESSAGES.SAVE_PAGE:
      savePage(payload, sendResponse)
      break
    case MESSAGES.SAVE_CLIPPING:
      saveClipping(payload, sendResponse)
      break
    case MESSAGES.SEARCH_HISTORY:
      searchHistory(payload, sendResponse)
      break
    case MESSAGES.UPDATE_ICON:
      updateExtensionIcon()
      break
    default:
      // default case action here
      break
  }

  return true
})

async function savePage(payload: PageData, sendResponse = (resp: any) => {}) {
  log('SAVE Page --- ', payload)

  try {
    const response = await savePageAPICall(payload)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    sendResponse(data)
    log(data)
  } catch (e) {
    console.error(e)
  }
}

async function savePageAPICall(payload: PageData) {
  return await fetch(TARGET_HOST + API.SAVE_PAGE, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

async function saveClipping(payload: SaveClipping, sendResponse) {
  const { pageData, ...rest } = payload
  try {
    const savePageResponse = await savePageAPICall(pageData)

    if (!savePageResponse.ok) {
      sendResponse({ error: savePageResponse.status })
      throw new Error('Network response was not ok')
    }

    const { dataSource } = (await savePageResponse.json()) as CreatePageResponse
    log('dataSource', dataSource)

    if (!dataSource) {
      sendResponse({ error: 'No dataSource' })
      throw new Error('No dataSource')
    }

    const saveClippingData = {
      ...rest,
      dataSourceId: dataSource.id,
    }

    console.log('saveClippingData', saveClippingData)

    const response = await fetch(TARGET_HOST + API.CLIPPING, {
      method: 'POST',
      body: JSON.stringify(saveClippingData),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      sendResponse({ error: response.status })
      throw new Error('Network response was not ok')
    }

    const data = await response.json()
    log(data)

    sendResponse(data)
  } catch (e) {
    console.error(e)
  }
}

// Based on Auto/Manual save, update the extension icon
async function updateExtensionIcon() {
  const autoSave = await getAutoSaveStatus()

  chrome?.action?.setIcon({
    path: autoSave ? autoModeIcon : manualModeIcon,
  })

  log('autoSave update --- :', autoSave)
}

async function searchHistory(payload, sendResponse) {
  log(payload)

  try {
    const result = await fetch(TARGET_HOST + API.SEARCH_HISTORY, {
      method: 'POST',
      body: JSON.stringify({
        userId: TEST_USER,
        searchQuery: payload.searchQuery,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const websites = await result.json()
    log(websites)
    sendResponse(websites)
  } catch (e) {
    log('error', e)
    sendResponse('')
  }
}

let storage: Storage

async function initializeExtension() {
  storage = new Storage()

  const settings = (await storage.get('settings')) as SettingsStored

  console.log(settings)
  if (!settings) {
    await storage.set('settings', DEFAULT_EXTENSION_SETTINGS)
  }

  updateExtensionIcon()

  const clippingList = await getClippingList()
  if (clippingList?.length) {
    console.log(1111, clippingList)
    storage.set('clippingList', clippingList)
  }
}

async function getAutoSaveStatus() {
  const settings = (await storage.get('settings')) as SettingsStored
  return settings?.autoSave
}

async function getClippingList() {
  try {
    const result = await fetch(TARGET_HOST + API.CLIPPING)
    if (!result.ok) {
      throw new Error('Network response was not ok')
    }
    return await result.json()
  } catch (e) {
    log('error', e)
    return []
  }
}

initializeExtension()
