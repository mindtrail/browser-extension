import { getSelector } from '../utils/find-selector'
import { getHref } from '../utils/find-href'
import { debounceEvent } from '../utils/process-queue'
import { createBaseEvent } from './base-event'
import { EVENT_TYPES } from '~/lib/constants'

const { CLICK } = EVENT_TYPES

export function handleClickEvent(event, callback) {
  const { target } = event
  const selector = getSelector(target)

  if (!target || (selector && selector.includes('plasmo-csui'))) {
    return
  }
  if (target.nodeName === 'INPUT' || target.nodeName === 'TEXTAREA') {
    return
  }

  const href = getHref(target)

  let { eventKey, eventDetails } = createBaseEvent({ event, selector, type: CLICK })
  eventDetails = {
    ...eventDetails,
    ...(href !== null && { href }),
  }
  debounceEvent(eventKey, eventDetails, callback)
}
