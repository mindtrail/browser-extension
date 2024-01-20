// import manualModeIcon from 'data-base64:~assets/icon-disabled.png'
import autoModeIcon from 'url:~assets/icon.development-32.png'
import manualModeIcon from 'url:~assets/manual-32.png'

import { Storage } from '@plasmohq/storage'

import { MESSAGES, HOST, API } from '~/lib/constants'
import { log } from '~/lib/utils'

const TEST_USER = 'clnj8rr9r00009krsmk10j07o'

const NODE_ENV = process.env.NODE_ENV
const IS_DEV = NODE_ENV === 'development'
const TARGET_HOST = IS_DEV ? HOST.LOCAL : HOST.REMOTE

updateExtensionIcon()

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { message, payload } = request

  log(
    sender.tab
      ? 'From Content script:' + sender.tab.url + message
      : 'From Extension' + message,
  )

  switch (message) {
    case MESSAGES.SAVE_PAGE:
      saveData(payload, sendResponse)
      break
    case MESSAGES.SAVE_CLIPPING:
      saveClipping(payload, sendResponse)
      break
    case MESSAGES.SEARCH_HISTORY:
      searchHistorySemantic(payload, sendResponse)
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

async function saveData(payload, sendResponse) {
  log('SAVE Page --- ', payload)

  try {
    const result = await fetch(TARGET_HOST + API.SAVE_PAGE, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    sendResponse(result)
    log(result)
  } catch (e) {
    console.error(e)
  }
}

async function saveClipping(payload, sendResponse) {
  log('SAVE Clipping --- ', payload)

  try {
    const result = await fetch(TARGET_HOST + API.SAVE_CLIPPING, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    sendResponse(result)
    log(result)
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

async function searchHistorySemantic(payload, sendResponse) {
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

async function getAutoSaveStatus() {
  const storage = new Storage()
  const settings = (await storage.get('settings')) as StorageData

  return settings?.autoSave
}
