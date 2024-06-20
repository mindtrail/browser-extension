import { type MouseEvent } from 'react'
import { getSelector } from '~lib/utils/recorder/find-selector'
import { getHref } from '~lib/utils/recorder/find-href'
import { ACTION_TYPE } from '~/lib/constants'
import { debounceEvent } from './debounce-event'
import { createBaseEvent } from './base-event'

const { CLICK, EXTRACT } = ACTION_TYPE

export function handleClickEvent(event: MouseEvent, callback) {
  const { altKey } = event
  const target = event?.target as HTMLElement

  const selector = getSelector(target)

  if (!target || (selector && selector.includes('plasmo-csui'))) {
    return
  }
  if (target.nodeName === 'INPUT' || target.nodeName === 'TEXTAREA') {
    return
  }

  const href = getHref(target)
  const actionType = altKey ? EXTRACT : CLICK

  let { eventKey, eventDetails } = createBaseEvent({ event, selector, type: actionType })
  eventDetails = {
    ...eventDetails,
    ...(href !== null && { href }),
  }

  debounceEvent(eventKey, eventDetails, callback)
}
