import { getSelector } from '../utils/find-selector'
import { debounceEvent } from '../utils/process-queue'
import { getValue } from '../utils/get-value'
import { getContent } from '../utils/get-content'
import { createBaseEvent } from './base-event'
import { EVENT_TYPES } from '~/lib/constants'

const { INPUT } = EVENT_TYPES

export function handleInputEvent(event, callback) {
  const { target } = event
  const selector = getSelector(target)

  if (!target || (selector && selector.includes('plasmo-csui'))) {
    return
  }

  const value = getValue({ type: INPUT, target })
  const textContent = getContent({ type: INPUT, target })

  let { eventKey, eventDetails } = createBaseEvent({ event, selector, type: INPUT })

  eventDetails = {
    ...eventDetails,
    ...(textContent !== null && { textContent }),
    ...(value !== null && { value }),
  }
  debounceEvent(eventKey, eventDetails, callback)
}
