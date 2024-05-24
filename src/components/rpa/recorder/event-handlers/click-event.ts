import { getSelector } from '../find-selector'
import { getHref } from '../find-href'
import { getValue } from '../get-value'
import { getContent } from '../get-content'
import { debounceEvent } from '../process-queue'
import { EVENT_TYPES } from '../event-types'

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
  const value = getValue({ type: EVENT_TYPES.CLICK, target })
  const textContent = getContent({ type: EVENT_TYPES.CLICK, target })
  const timeStamp = Date.now()
  const eventKey = `${EVENT_TYPES.CLICK}-${selector}`
  const eventDetails = {
    id: `${timeStamp}`,
    eventKey,
    type: EVENT_TYPES.CLICK,
    selector,
    ...(value !== null && { value }),
    ...(textContent !== null && { textContent }),
    ...(target.name !== null && { name: target.name }),
    ...(target.baseURI !== null && { baseURI: target.baseURI }),
    ...(href !== null && { href }),
    ...(target.type !== null && { targetType: target.type }),
  }
  debounceEvent(eventKey, eventDetails, callback)
}
