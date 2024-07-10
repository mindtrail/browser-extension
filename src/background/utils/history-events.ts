import { getRecorderState } from './storage/recorder'
import { setActionsStore } from '~lib/utils/recorder/actions-store'

let listenersAdded = false
export function listenForHistoryEvents() {
  if (listenersAdded) return

  let debounceTimeout: NodeJS.Timeout | null = null
  chrome.history.onVisited.addListener(async ({ url }) => {
    const recorderState = await getRecorderState()
    if (!recorderState?.isRecording || recorderState?.isPaused) return

    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
    }

    debounceTimeout = setTimeout(async () => {
      setActionsStore(url)
    }, 500)
  })

  listenersAdded = true
}
