import { debounceEvent } from '../utils/process-queue'
import { EVENT_TYPES } from '~/lib/constants'
import { createBaseEvent } from './base-event'

export function handleUrlEvent(event, callback) {
  const { eventKey, eventDetails } = createBaseEvent({ event, type: EVENT_TYPES.NAV })
  debounceEvent(eventKey, eventDetails, callback)
}
