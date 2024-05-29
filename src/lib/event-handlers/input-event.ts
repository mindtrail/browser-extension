import { getSelector } from '~/lib/recorder-utils/find-selector'
import { EVENT_TYPES } from '~/lib/constants'
import { debounceEvent } from './debounce-event'
import { createBaseEvent } from './base-event'

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
