import { EVENT_TYPES } from './event-types'
import { handleClickEvent } from './event-handlers/click-event'
import { handleInputEvent } from './event-handlers/input-event'
import { handleUrlEvent } from './event-handlers/url-event'
import { onBackgroundEvent } from '~lib/background/recorder-storage'

function createEventHandler(callback) {
  return (event) => {
    switch (event.type) {
      case EVENT_TYPES.CLICK:
        handleClickEvent(event, callback)
        break
      case EVENT_TYPES.INPUT:
        handleInputEvent(event, callback)
        break
      case EVENT_TYPES.URL:
        handleUrlEvent(event, callback)
        break
      default:
        break
    }
  }
}

function addEventListeners(eventHandler) {
  document.addEventListener(EVENT_TYPES.CLICK, eventHandler, true)
  document.addEventListener(EVENT_TYPES.INPUT, eventHandler, true)
  onBackgroundEvent(eventHandler)
}

function removeEventListeners(eventHandler) {
  document.removeEventListener(EVENT_TYPES.CLICK, eventHandler, true)
  document.removeEventListener(EVENT_TYPES.INPUT, eventHandler, true)
}

export function listenEvents(callback, shouldListen) {
  let eventHandler = createEventHandler(callback)

  if (shouldListen) {
    addEventListeners(eventHandler)
  } else {
    removeEventListeners(eventHandler)
  }

  return () => {
    removeEventListeners(eventHandler)
  }
}
