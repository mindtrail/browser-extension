import { DOM_EVENT } from '~/lib/constants'
import { handleClickEvent } from '~/lib/utils/event-handlers/record/click-event'
import { handleInputEvent } from '~/lib/utils/event-handlers/record/input-event'
import {
  handleMouseOver,
  handleKeyDown,
  handleKeyUp,
} from '~/lib/utils/event-handlers/ui-state'
import { addEventListeners, removeEventListeners } from './add-remove-listeners'

const { CLICK, INPUT, MOUSEOVER, KEYDOWN, KEYUP } = DOM_EVENT

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
