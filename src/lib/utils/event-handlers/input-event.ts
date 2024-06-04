import { getSelector } from '~lib/utils/recorder/find-selector'
import { ACTION_TYPES } from '~/lib/constants'
import { debounceEvent } from './debounce-event'
import { createBaseEvent } from './base-event'

const { INPUT } = ACTION_TYPES

export function handleInputEvent(event, callback) {
  const { target } = event
  const selector = getSelector(target)
  console.log(event)

  if (!target || (selector && selector.includes('plasmo-csui'))) {
    return
  }

  let { eventKey, eventDetails } = createBaseEvent({ event, selector, type: INPUT })

  debounceEvent(eventKey, eventDetails, callback)
}
