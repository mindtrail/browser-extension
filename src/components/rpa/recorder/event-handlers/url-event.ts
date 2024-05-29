import { debounceEvent } from '../utils/process-queue'
import { EVENT_TYPES } from '~/lib/constants'

export function handleUrlEvent(event, callback) {
  const timeStamp = Date.now()
  const eventKey = `${EVENT_TYPES.NAV}-${event.url}`
  const eventDetails = {
    id: `${timeStamp}`,
    eventKey,
    type: EVENT_TYPES.NAV,
    url: event.url,
  }
  debounceEvent(eventKey, eventDetails, callback)
}
