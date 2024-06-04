import { ACTION_TYPE } from '~/lib/constants'
import { createBaseEvent } from '~lib/utils/event-handlers/record/base-event'

import { getRecorderState, setRecorderState } from './storage/recorder'

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
  const newEvent = { type: ACTION_TYPE.NAV, url }

  const { eventDetails } = createBaseEvent({
    event: newEvent,
    type: ACTION_TYPE.NAV,
  })

  const { eventsList = [] } = recorderState
  const updatedEventsList = [...eventsList, eventDetails]

  await setRecorderState({ ...recorderState, eventsList: updatedEventsList })
}
