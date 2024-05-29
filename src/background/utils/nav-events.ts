import { EVENT_TYPES } from '~/lib/constants'
import { getRecorderState, setRecorderState } from './storage/recorder'

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
  let debounceTimeout: NodeJS.Timeout | null = null
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const recorderState = await getRecorderState()

    if (!recorderState?.isRecording || recorderState?.isPaused) return

    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
    }

    debounceTimeout = setTimeout(async () => {
      const tab = await chrome.tabs.get(activeInfo.tabId)
      const url = tab.url || tab.pendingUrl
      const navEvent = { type: EVENT_TYPES.NAV, data: { url } }

      await createNavEvent(navEvent)
    }, 1000)
  })
}

async function createNavEvent(event) {
  const recorderState = await getRecorderState()
  const { navEvents = [] } = recorderState

  console.log('createNavEvent', recorderState)
  const updatedEvents = [...navEvents, event]

  const payload = { ...recorderState, navEvents: updatedEvents }
  console.log('createNavEvent', payload)

  await setRecorderState({ ...recorderState, navEvents: updatedEvents })
  return event
}

export function extendedNavListeners() {
  // // Listen for tab activation (tab changes)
  // chrome.tabs.onActivated.addListener((activeInfo) => {
  //   chrome.tabs.get(activeInfo.tabId, (tab) => {
  //     if (chrome.runtime.lastError) {
  //       console.error('Error retrieving tab:', chrome.runtime.lastError)
  //       return
  //     }
  //     console.log('Tab changed to:', tab)
  //     addNavigationEvent({ activeTabId: activeInfo.tabId })
  //   })
  // })

  // Listen for new tab creation
  chrome.tabs.onCreated.addListener((tab) => {
    console.log('New tab opened:', tab)
    addNavigationEvent({ newTabId: tab.id })
  })

  // Listen for navigation events
  chrome.webNavigation.onCompleted.addListener(
    (details) => {
      if (details.url === prevUrl) {
        // console.log('Duplicate navigation event detected, ignoring.')
        return
      }
      if (details?.frameId !== 0) {
        // console.log('Ignoring navigation event for non-top frame')
        return
      }

      prevUrl = details.url
      // console.log('Navigation completed:', details)
      addNavigationEvent({ currentUrl: details.url })
    },
    { url: [{ schemes: ['http', 'https'] }] },
  )

  chrome.webNavigation.onHistoryStateUpdated.addListener(
    (details) => {
      if (details.url === prevUrl) {
        // console.log('Duplicate navigation event detected, ignoring.', prevUrl)
        return
      }

      prevUrl = details.url
      // console.log('In-page navigation:', details)
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
async function addNavigationEvent(newState) {
  // TBD
}
