import { type MouseEvent } from 'react'
import { getSelector } from '~lib/utils/recorder/find-selector'
import { getHref } from '~lib/utils/recorder/find-href'
import { ACTION_TYPE } from '~/lib/constants'
import { debounceEvent } from './debounce-event'
import { createBaseEvent } from './base-event'
import { getElementDescription } from '~lib/utils/recorder/get-element-description'
import { getHtmlContext } from '~lib/utils/recorder/get-html-context'

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
  const { element, text: event_description } = getElementDescription(selector)
  const html_context = getHtmlContext(element)

  let { eventKey, eventDetails } = createBaseEvent({ event, selector, type: actionType })
  eventDetails = {
    ...eventDetails,
    ...(href !== null && { href }),
    ...(event_description && { event_description }),
    ...(html_context && { html_context }),
  }

  debounceEvent(eventKey, eventDetails, callback)
}
