import { getRecorderState } from './storage/recorder'
import { setActionGroup } from '~lib/utils/recorder/action-groups'

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
      setActionGroup(url)
    }, 500)
  })

  listenersAdded = true
}
