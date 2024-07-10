import { type MouseEvent } from 'react'
import { getSelector } from '~lib/utils/recorder/find-selector'
import { getHref } from '~lib/utils/recorder/find-href'
import { ACTION_TYPE } from '~/lib/constants'
import { debounceEvent } from './debounce-event'
import { createBaseEvent } from './base-event'
import { getElementDescription } from '~lib/utils/recorder/get-element-description'

const { CLICK, EXTRACT } = ACTION_TYPE

export async function handleClickEvent(event: MouseEvent, callback) {
  const { altKey } = event
  const target = event?.target as HTMLElement

  let selector = {
    default: getSelector(target),
  }

  if (!target || (selector.default && selector.default.includes('plasmo-csui'))) {
    return
  }
  if (target.nodeName === 'INPUT' || target.nodeName === 'TEXTAREA') {
    return
  }

  const href = getHref(target)
  const actionType = altKey ? EXTRACT : CLICK
  const { text: event_description } = getElementDescription(target)

  let { eventKey, eventDetails } = createBaseEvent({ event, selector, type: actionType })
  eventDetails = {
    ...eventDetails,
    ...(href !== null && { href }),
    ...(event_description && { event_description }),
  }

  debounceEvent(eventKey, eventDetails, callback)
}
