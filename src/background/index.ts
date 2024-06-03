import { initializeExtension } from './utils/initialize'
import { listenForNavigationEvents } from './utils/nav-events'

// Ensure listeners are added when the extension is installed or updated
chrome.runtime.onInstalled.addListener(async () => {
  initializeExtension()
  listenForNavigationEvents()
})
