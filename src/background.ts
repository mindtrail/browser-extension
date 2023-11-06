// import manualModeIcon from 'data-base64:~assets/icon-disabled.png'
import autoModeIcon from 'url:~assets/icon.development-32.png'
import manualModeIcon from 'url:~assets/manual-32.png'

import { Storage } from '@plasmohq/storage'

import { MESSAGES } from '~/lib/constants'

const SEARCH_URL = 'http://localhost:3000/api/history'
const LOCAL_URL = 'http://localhost:3000/api/embed/html'
const REMOTE_URL = 'https://app-chat-jgnk6lxbhq-ey.a.run.app/api/embed/html'
const TEST_USER = 'clnj8rr9r00009krsmk10j07o'

const NODE_ENV = process.env.NODE_ENV
const EMBEDDING_URL = NODE_ENV === 'development' ? LOCAL_URL : REMOTE_URL

updateExtensionIcon()

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { message, payload } = request

  console.log(
    sender.tab
      ? 'from a content 2121 script:' + sender.tab.url + message
      : 'from the 1222 extension' + message
  )

  if (message === MESSAGES.USER_TRIGGERED_SAVE) {
    callEmbeddingEndpoint(payload, sendResponse)
  }

  if (message === MESSAGES.AUTO_SAVE) {
    callEmbeddingEndpoint(payload, sendResponse)
  }

  if (message === MESSAGES.SEARCH_HISTORY) {
    searchHistorySemantic(payload, sendResponse)
  }

  if (message === MESSAGES.UPDATE_ICON) {
    updateExtensionIcon()
  }

  return true
})

async function searchHistorySemantic(payload, sendResponse) {
  console.log(payload)

  try {
    const result = await fetch(SEARCH_URL, {
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
    console.log(websites)
    sendResponse(websites)
  } catch (e) {
    console.log('error', e)
    sendResponse('')
  }
}

async function callEmbeddingEndpoint(payload, sendResponse) {
  console.log(payload)
  try {
    const result = await fetch(EMBEDDING_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    sendResponse({ result })
    console.log(await result.json())
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

  console.log('autoSave update --- :', autoSave)
}

async function getAutoSaveStatus() {
  const storage = new Storage()
  const settings = (await storage.get('settings')) as StorageData

  return settings?.autoSave
}
