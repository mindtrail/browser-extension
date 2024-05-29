import { getSelector } from '../utils/find-selector'
import { debounceEvent } from '../utils/process-queue'
import { createBaseEvent } from './base-event'
import { EVENT_TYPES } from '~/lib/constants'

const { INPUT } = EVENT_TYPES

export function handleInputEvent(event, callback) {
  const { target } = event
  const selector = getSelector(target)

  if (!target || (selector && selector.includes('plasmo-csui'))) {
    return
  }

  let { eventKey, eventDetails } = createBaseEvent({ event, selector, type: INPUT })

  debounceEvent(eventKey, eventDetails, callback)
}
