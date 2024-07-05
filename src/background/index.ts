import { initializeExtension } from './utils/initialize'
import { listenForNavigationEvents } from './utils/nav-events'
import { listenForAudioInput } from './utils/audio-input'
import { listenForHistoryEvents } from './utils/history-events'

// Ensure listeners are added when the extension is installed or updated
chrome.runtime.onInstalled.addListener(async () => {
  initializeExtension()
  listenForNavigationEvents()
  listenForAudioInput()
  listenForHistoryEvents()
})
