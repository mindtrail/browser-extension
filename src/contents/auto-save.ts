import { type PlasmoCSConfig } from 'plasmo'

import { Storage } from '@plasmohq/storage'

import { AUTO_SAVE_DELAY, MESSAGES, STORAGE_KEY } from '~/lib/constants'
import { getPageData } from '~/lib/page-data'

export const CONTENT_SCRIPT_MATCH = ['https://*/*', 'http://*/*', 'file://*/*']

export const CONTENT_SCRIPT_EXCLUDE = [
  'http://localhost:*/*',
  'https://*.google.com/*',
  'https://www.google.com/*',
  'https://*.slack.com/*',
  'https://*.zoom.us/*',
  'https://*.youtube.com/*',
  'https://*.openai.com/*',
  'https://*.github.com/*',
  'https://*.gmail.com/*',
  'https://*.plasmo.com/*',
]

export const PLASMO_CONFIG: PlasmoCSConfig = {
  matches: CONTENT_SCRIPT_MATCH,
  exclude_matches: CONTENT_SCRIPT_EXCLUDE,
}

const storage = new Storage({ area: 'local' })

let minuteTimeout = null
let lastFocusTime = 0
let timeSpent = 0
let contentSaved = false
let autoSaveDelay = AUTO_SAVE_DELAY

// Function to start or resume the timer
function startTimer() {
  if (contentSaved) {
    return
  }

  lastFocusTime = Date.now()
  console.log('Timer remaining', autoSaveDelay - timeSpent)
  minuteTimeout = setTimeout(savePageContent, (autoSaveDelay - timeSpent) * 1000)
}

// Function to pause the timer
function pauseTimer() {
  if (contentSaved) {
    return
  }

  clearTimeout(minuteTimeout)
  timeSpent += (Date.now() - lastFocusTime) / 1000
  console.log('Timer paused', timeSpent)
}

function savePageContent() {
  // Set flag to prevent further calls
  contentSaved = true
  // Extract page data and send to background script or save directly
  const payload = getPageData()

  chrome.runtime.sendMessage({
    message: MESSAGES.SAVE_PAGE,
    payload: {
      ...payload,
      autoSave: true,
    },
  })
}

async function initAutoSave() {
  const settings = (await storage.get(STORAGE_KEY.SETTINGS)) as SettingsStored

  if (settings?.autoSave) {
    autoSaveDelay = settings.saveDelay
    startTimer()

    // Set up event listeners
    window.addEventListener('focus', startTimer)
    window.addEventListener('blur', pauseTimer)
  }
}

initAutoSave()
