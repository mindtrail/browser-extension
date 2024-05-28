import { getSelector } from '../utils/find-selector'
import { debounceEvent } from '../utils/process-queue'
import { EVENT_TYPES } from '../utils/constants'
import { createDOMEvent } from './dom-event'

export function handleInputEvent(event, callback) {
  const { target } = event
  const selector = getSelector(target)

  if (!target || (selector && selector.includes('plasmo-csui'))) {
    return
  }

  let { eventKey, eventDetails } = createDOMEvent(event)

  eventDetails = {
    ...eventDetails,
    type: EVENT_TYPES.INPUT,
  }
  debounceEvent(eventKey, eventDetails, callback)
}
