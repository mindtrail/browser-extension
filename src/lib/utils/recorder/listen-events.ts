import { DOM_EVENT } from '~/lib/constants'
import { handleClickEvent } from '~lib/utils/recorder/event-handlers/click-event'
import { handleInputEvent } from '~lib/utils/recorder/event-handlers/input-event'
import {
  handleMouseOver,
  handleKeyDown,
  handleKeyUp,
} from '~lib/utils/recorder/event-handlers/ui-state'

const { CLICK, INPUT, MOUSEOVER, KEYDOWN, KEYUP } = DOM_EVENT

type Event = {
  type: DOM_EVENT
  handler: (event: any) => any
}
function addEventListeners(eventList: Event[]) {
  eventList.forEach(({ type, handler }) => document.addEventListener(type, handler, true))
}

function removeEventListeners(eventList: Event[]) {
  eventList.forEach(({ type, handler }) =>
    document.removeEventListener(type, handler, true),
  )
}

export function listenEventsToRecord(callback) {
  const clickEvents = [
    { type: CLICK, handler: (e) => handleClickEvent(e, callback) },
    { type: INPUT, handler: (e) => handleInputEvent(e, callback) },
  ]
  addEventListeners(clickEvents)

  return () => removeEventListeners(clickEvents)
}

export function listenEventsForUIState(resetRecorderState) {
  const highlightEvents = [
    { type: MOUSEOVER, handler: handleMouseOver },
    { type: KEYDOWN, handler: (e) => handleKeyDown(e, resetRecorderState) },
    { type: KEYUP, handler: handleKeyUp },
  ]
  addEventListeners(highlightEvents)

  return () => removeEventListeners(highlightEvents)
}
