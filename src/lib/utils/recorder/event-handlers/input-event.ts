import { getSelector } from '~lib/utils/recorder/find-selector'
import { ACTION_TYPE } from '~/lib/constants'
import { debounceEvent } from './debounce-event'
import { createBaseEvent } from './base-event'
import { getElementDescription } from '~lib/utils/recorder/get-element-description'
import { getHtmlContext } from '~lib/utils/recorder/get-html-context'

const { INPUT } = ACTION_TYPE

export function handleInputEvent(event, callback) {
  const { target } = event
  const selector = getSelector(target)

  if (!target || (selector && selector.includes('plasmo-csui'))) {
    return
  }

  const { element, text: event_description } = getElementDescription(selector)
  const html_context = getHtmlContext(element)

  let { eventKey, eventDetails } = createBaseEvent({ event, selector, type: INPUT })
  eventDetails = {
    ...eventDetails,
    ...(event_description && { event_description }),
    ...(html_context && { html_context }),
  }

  debounceEvent(eventKey, eventDetails, callback)
}
