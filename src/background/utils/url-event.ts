import { debounceEvent } from '~/lib/event-handlers/debounce-event'
import { EVENT_TYPES } from '~/lib/constants'
import { createBaseEvent } from '../../lib/event-handlers/base-event'

export function handleUrlEvent(event, callback) {
  const { eventKey, eventDetails } = createBaseEvent({ event, type: EVENT_TYPES.NAV })
  debounceEvent(eventKey, eventDetails, callback)
}
