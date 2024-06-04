import { DOM_EVENT } from '~/lib/constants'
import { handleClickEvent } from '~lib/utils/event-handlers/click-event'
import { handleInputEvent } from '~lib/utils/event-handlers/input-event'
import { addEventListeners, removeEventListeners } from './add-remove-listeners'

const { CLICK, INPUT } = DOM_EVENT

interface ListenForActions {
  callback: (event: Event) => void
  shouldListen: boolean
}
export function listenForActions({ callback, shouldListen }: ListenForActions) {
  console.log(123)
  const clickEvents = [
    { type: CLICK, handler: (e) => handleClickEvent(e, callback) },
    { type: INPUT, handler: (e) => handleInputEvent(e, callback) },
  ]

  if (shouldListen) {
    addEventListeners(clickEvents)
  } else {
    removeEventListeners(clickEvents)
  }

  return () => removeEventListeners(clickEvents)
}
