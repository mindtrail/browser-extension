import { getSelector } from '~lib/utils/recorder/find-selector'
import { ACTION_TYPE } from '~/lib/constants'
import { debounceEvent } from './debounce-event'
import { createBaseEvent } from './base-event'
import { getElementDescription } from '~lib/utils/recorder/get-element-description'

const { INPUT } = ACTION_TYPE

export async function handleInputEvent(event, callback) {
  const { target } = event
  let selector = getSelector(target)

  if (!target || (selector && selector.includes('plasmo-csui'))) {
    return
  }

  const { text: event_description } = getElementDescription(target)

  let { eventKey, eventDetails } = createBaseEvent({ event, selector, type: INPUT })
  eventDetails = {
    ...eventDetails,
    ...(event_description && { event_description }),
  }

  debounceEvent(eventKey, eventDetails, callback)
}
