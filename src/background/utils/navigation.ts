import { getRecorderState, createBackgroundEvent } from '~background/utils/recorder-storage'
import { EVENT_TYPES } from '~/lib/constants'

let flowRecorderState = {}

// Function to update state and notify all tabs
export function addNavigationEvent(newState) {
  // chrome.storage.local.set({ flowRecorderState }, () => {
  //   chrome.tabs.query({}, (tabs) => {
  //     tabs.forEach((tab) => {
  //       chrome.tabs.sendMessage(tab.id, {
  //         type: 'stateUpdated',
  //         newState: flowRecorderState,
  //       })
  //     })
  //   })
  // })
}

let listenersAdded = false
// In page navigation can trigger twice, eg. having a SSR page can trigger this.
// In page navigation & onCompleted will trigger both when navigating to a new page
let prevUrl = ''

export function listenForNavigationEvents() {
  if (listenersAdded) {
    // console.log('Listeners already added')
    return
  }

  // Current URL event
  let debounceTimeout
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const state = await getRecorderState()
    if (!state.isRecording) return
    if (debounceTimeout) clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(async () => {
      const tab = await chrome.tabs.get(activeInfo.tabId)
      const url = tab.url || tab.pendingUrl
      await createBackgroundEvent({ type: EVENT_TYPES.URL, data: { url } })
    }, 1000)
  })

  console.log(111)
  // Listen for tab activation (tab changes)
  chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      if (chrome.runtime.lastError) {
        console.error('Error retrieving tab:', chrome.runtime.lastError)
        return
      }
      console.log('Tab changed to:', tab)
      addNavigationEvent({ activeTabId: activeInfo.tabId })
    })
  })

  // Listen for new tab creation
  chrome.tabs.onCreated.addListener((tab) => {
    console.log('New tab opened:', tab)
    addNavigationEvent({ newTabId: tab.id })
  })

  // Listen for navigation events
  chrome.webNavigation.onCompleted.addListener(
    (details) => {
      if (details.url === prevUrl) {
        console.log('Duplicate navigation event detected, ignoring.')
        return
      }
      if (details?.frameId !== 0) {
        console.log('Ignoring navigation event for non-top frame')
        return
      }

      prevUrl = details.url
      console.log('Navigation completed:', details)
      addNavigationEvent({ currentUrl: details.url })
    },
    { url: [{ schemes: ['http', 'https'] }] },
  )

  chrome.webNavigation.onHistoryStateUpdated.addListener(
    (details) => {
      if (details.url === prevUrl) {
        console.log('Duplicate navigation event detected, ignoring.', prevUrl)
        return
      }

      prevUrl = details.url
      console.log('In-page navigation:', details)
      addNavigationEvent({ currentUrl: details.url })
    },
    { url: [{ schemes: ['http', 'https'] }] },
  )

  listenersAdded = true
}

// "permissions": [
//   "tabs",
//   "webNavigation",
//   "activeTab",
//   "storage"
// ],

// https://europe-central2-aiplatform.googleapis.com
