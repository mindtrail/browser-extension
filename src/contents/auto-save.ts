import type { PlasmoCSConfig } from "plasmo"

import { MESSAGES } from "~lib/constants"
import { getPageData } from "~lib/page-data"

export const config: PlasmoCSConfig = {
  matches: ["https://*/*", "http://*/*"]
}

let scrolledToBottom = false

// Check if user scrolled to the bottom
window.addEventListener("scroll", function () {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
    scrolledToBottom = true
  }
})

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
    payload
  })
}
