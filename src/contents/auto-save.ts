import type { PlasmoCSConfig } from 'plasmo'

import {
  AUTO_SAVE_INTERVAL,
  CONTENT_SCRIPT_EXCLUDE,
  CONTENT_SCRIPT_MATCH,
  MESSAGES,
} from '~lib/constants'
import { getPageData } from '~lib/page-data'

export const config: PlasmoCSConfig = {
  // matches: CONTENT_SCRIPT_MATCH,
  // exclude_matches: CONTENT_SCRIPT_EXCLUDE,
}

let minuteTimeout = null
let lastFocusTime = 0
let timeSpent = 0
let contentSaved = false

function savePageContent() {
  // Set flag to prevent further calls
  contentSaved = true
  // Extract page data and send to background script or save directly
  const payload = getPageData()

  console.log('Saving page content', payload)
  chrome.runtime.sendMessage({
    message: MESSAGES.AUTO_SAVE,
    payload,
  })
}

// Function to start or resume the timer
function startTimer() {
  if (contentSaved) {
    return
  }

  lastFocusTime = Date.now()
  console.log('Timer remaining', AUTO_SAVE_INTERVAL - timeSpent)
  minuteTimeout = setTimeout(
    savePageContent,
    (AUTO_SAVE_INTERVAL - timeSpent) * 1000
  )
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

// Set up event listeners
window.addEventListener('focus', startTimer)
window.addEventListener('blur', pauseTimer)

// Start the timer initially
startTimer()
