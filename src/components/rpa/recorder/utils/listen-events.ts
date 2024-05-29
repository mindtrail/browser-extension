import { EVENT_TYPES } from '~/lib/constants'
import { handleClickEvent } from '../event-handlers/click-event'
import { handleInputEvent } from '../event-handlers/input-event'
import { handleUrlEvent } from '../event-handlers/url-event'
import { onBackgroundEvent } from './listen-storage'

const { CLICK, INPUT, NAV } = EVENT_TYPES

function createEventHandler(callback) {
  return (event) => {
    switch (event.type) {
      case CLICK:
        handleClickEvent(event, callback)
        break
      case INPUT:
        handleInputEvent(event, callback)
        break
      case NAV:
        handleUrlEvent(event, callback)
        break
      default:
        break
    }
  }
}

function addEventListeners(eventHandler) {
  document.addEventListener(CLICK, eventHandler, true)
  document.addEventListener(INPUT, eventHandler, true)
  onBackgroundEvent(eventHandler)
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

  return () => {
    removeEventListeners(eventHandler)
  }
}
