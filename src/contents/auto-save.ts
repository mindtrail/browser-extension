import { Storage } from '@plasmohq/storage'

import { AUTO_SAVE_DELAY, MESSAGES, STORAGE_AREA } from '~/lib/constants'
import { getPageData } from '~/lib/page-data'
import { getBaseResourceURL } from '~lib/utils'

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
  const settings = (await storage.get(STORAGE_AREA.SETTINGS)) as SettingsStored

  if (settings?.autoSave) {
    const savedWebsites = (await storage.get(STORAGE_AREA.SAVED_WEBSITES)) as string[]
    const pageBaseURL = getBaseResourceURL(window.location.href)

    if (savedWebsites?.includes(pageBaseURL)) {
      return
    }

    console.log('Auto save enabled')

    autoSaveDelay = settings.saveDelay
    startTimer()

    // Set up event listeners
    window.addEventListener('focus', startTimer)
    window.addEventListener('blur', pauseTimer)
  }
}

initAutoSave()
