import { ACTION_TYPES } from '~/lib/constants'
import { handleClickEvent } from '~lib/utils/event-handlers/click-event'
import { handleInputEvent } from '~lib/utils/event-handlers/input-event'

const { CLICK, INPUT } = ACTION_TYPES
function createRecordingEventHandler(callback) {
  return (event) => {
    switch (event.type) {
      case ACTION_TYPES.CLICK:
        handleClickEvent(event, callback)
        break
      case ACTION_TYPES.INPUT:
        handleInputEvent(event, callback)
        break
      default:
        break
    }
  }
}

function createMetaEventHandler(handlers) {
  return (event) => {
    switch (event.type) {
      case 'mouseover':
        handlers.handleMouseOver(event)
        break
      case 'keydown':
        handlers.handleKeyDown(event)
        break
      case 'keyup':
        handlers.handleKeyUp(event)
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
  let eventHandler = createRecordingEventHandler(callback)

  if (shouldListen) {
    addEventListeners(eventHandler)
  } else {
    removeEventListeners(eventHandler)
  }

  return () => removeEventListeners(eventHandler)
}
