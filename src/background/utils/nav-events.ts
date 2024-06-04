import { getRecorderState, setRecorderState } from './storage/recorder'

import { ACTION_TYPES } from '~/lib/constants'
import { createBaseEvent } from '~/lib/utils/event-handlers/base-event'

let listenersAdded = false

export function listenForNavigationEvents() {
  if (listenersAdded) return

  // Current URL event
  let debounceTimeout: NodeJS.Timeout | null = null
  chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, async (tab) => {
      if (chrome.runtime.lastError) {
        console.error('Error retrieving tab:', chrome.runtime.lastError)
        return
      }

      const recorderState = await getRecorderState()
      if (!recorderState?.isRecording || recorderState?.isPaused) return

      if (debounceTimeout) {
        clearTimeout(debounceTimeout)
      }

      debounceTimeout = setTimeout(async () => {
        const url = tab.url || tab.pendingUrl
        await createNavEvent(url)
      }, 500)
    })
  })

  listenersAdded = true
}

async function createNavEvent(url: string) {
  const recorderState = await getRecorderState()
  const newEvent = { type: ACTION_TYPES.NAV, url }

  const { eventDetails } = createBaseEvent({
    event: newEvent,
    type: ACTION_TYPES.NAV,
  })

  const { eventsList = [] } = recorderState
  const updatedEventsList = [...eventsList, eventDetails]

  await setRecorderState({ ...recorderState, eventsList: updatedEventsList })
}

// @TODO: Ignore this for now -> to be developed
// In page navigation can trigger twice, eg. having a SSR page can trigger this.
// In page navigation & onCompleted will trigger both when navigating to a new page
let prevUrl = ''

export function extendedNavListeners() {
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
