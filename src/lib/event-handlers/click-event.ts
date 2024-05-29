import { getSelector } from '~/lib/recorder-utils/find-selector'
import { getHref } from '~/lib/recorder-utils/find-href'
import { EVENT_TYPES } from '~/lib/constants'
import { debounceEvent } from './debounce-event'
import { createBaseEvent } from './base-event'

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
