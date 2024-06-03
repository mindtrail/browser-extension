import { EVENT_TYPES } from '~/lib/constants'
import { handleClickEvent } from '~lib/utils/event-handlers/click-event'
import { handleInputEvent } from '~lib/utils/event-handlers/input-event'

const { CLICK, INPUT } = EVENT_TYPES

function createEventHandler(callback) {
  return (event) => {
    switch (event.type) {
      case CLICK:
        handleClickEvent(event, callback)
        break
      case INPUT:
        handleInputEvent(event, callback)
        break
      default:
        break
    }
  }
}

function addEventListeners(eventHandler) {
  document.addEventListener(CLICK, eventHandler, true)
  document.addEventListener(INPUT, eventHandler, true)
}

function removeEventListeners(eventHandler) {
  document.removeEventListener(CLICK, eventHandler, true)
  document.removeEventListener(INPUT, eventHandler, true)
}

export function listenEvents(callback, shouldListen) {
  let eventHandler = createEventHandler(callback)

  if (shouldListen) {
    addEventListeners(eventHandler)
  } else {
    removeEventListeners(eventHandler)
  }

  return () => removeEventListeners(eventHandler)
}
