import type { PlasmoCSConfig } from 'plasmo'

import { MESSAGES } from '~lib/constants'
import { getPageData } from '~lib/page-data'

export const config: PlasmoCSConfig = {
  matches: ['file://*/*'],
  // exclude_matches: [
  //   'http://localhost:*/*',
  //   'https://*.google.com/*',
  //   'https://slack.com/*',
  //   'https://*.slack.com/*',
  // ],
}

let scrolledToBottom = false

// Check if user scrolled to the bottom
window.addEventListener('scroll', function () {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
    scrolledToBottom = true
  }
})

console.log(222)
// Wait for 60 seconds
const minuteTimeout = setTimeout(savePageContent, 60 * 1000)

// Wait for 30 seconds
const scrollTimeout = setTimeout(function () {
  if (scrolledToBottom) {
    savePageContent()
    clearTimeout(minuteTimeout)
    clearTimeout(scrollTimeout)
  }
}, 30 * 1000)

function savePageContent() {
  // Extract page data and send to background script or save directly
  const payload = getPageData()

  chrome.runtime.sendMessage({
    message: MESSAGES.AUTO_SAVE,
    payload,
  })
}

// Add an event listener for the beforeunload event
window.addEventListener('beforeunload', () => {
  console.log(3333)
  clearTimeout(minuteTimeout)
  clearTimeout(scrollTimeout)
})
