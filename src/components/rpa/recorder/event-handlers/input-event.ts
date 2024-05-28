import { getSelector } from '../find-selector'
import { getValue } from '../get-value'
import { getContent } from '../get-content'
import { debounceEvent } from '../process-queue'
import { EVENT_TYPES } from '../event-types'

export function handleInputEvent(event, callback) {
  const { target } = event
  const selector = getSelector(target)
  if (!target || (selector && selector.includes('plasmo-csui'))) {
    return
  }
  const value = getValue({ type: EVENT_TYPES.INPUT, target })
  const textContent = getContent({ type: EVENT_TYPES.INPUT, target })
  const timeStamp = Date.now()
  const eventKey = `${EVENT_TYPES.INPUT}-${selector}`
  const eventDetails = {
    id: `${timeStamp}`,
    eventKey,
    type: EVENT_TYPES.INPUT,
    selector,
    ...(value !== null && { value }),
    ...(textContent !== null && { textContent }),
    ...(target.name !== null && { name: target.name }),
    ...(target.baseURI !== null && { baseURI: target.baseURI }),
    ...(target.type !== null && { targetType: target.type }),
  }
  debounceEvent(eventKey, eventDetails, callback)
}
