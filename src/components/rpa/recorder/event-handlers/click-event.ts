import { getSelector } from '../utils/find-selector'
import { getHref } from '../utils/find-href'
import { debounceEvent } from '../utils/process-queue'
import { createBaseEvent } from './base-event'
import { getContent } from '../utils/get-content'
import { getValue } from '../utils/get-value'
import { EVENT_TYPES } from '~/lib/constants'

const { INPUT } = EVENT_TYPES

export function handleClickEvent(event, callback) {
  const { target } = event
  const selector = getSelector(target)

  if (!target || (selector && selector.includes('plasmo-csui'))) {
    return
  }
  if (target.nodeName === 'INPUT' || target.nodeName === 'TEXTAREA') {
    return
  }

  const value = getValue({ type: INPUT, target })
  const textContent = getContent({ type: INPUT, target })
  const href = getHref(target)

  let { eventKey, eventDetails } = createBaseEvent({ event, selector, type: INPUT })

  eventDetails = {
    ...eventDetails,
    ...(textContent !== null && { textContent }),
    ...(value !== null && { value }),
    ...(href !== null && { href }),
  }
  debounceEvent(eventKey, eventDetails, callback)
}
