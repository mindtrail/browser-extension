import { getSelector } from '../utils/find-selector'
import { getHref } from '../utils/find-href'
import { debounceEvent } from '../utils/process-queue'
import { createDOMEvent } from './dom-event'
import { EVENT_TYPES } from '~/lib/constants'

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
  let { eventKey, eventDetails } = createDOMEvent(event)

  eventDetails = {
    ...eventDetails,
    type: EVENT_TYPES.CLICK,
    ...(href !== null && { href }),
  }
  debounceEvent(eventKey, eventDetails, callback)
}
