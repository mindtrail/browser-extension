import { getSelector } from '../utils/find-selector'
import { getValue } from '../utils/get-value'
import { getContent } from '../utils/get-content'
import { EVENT_TYPES } from '~/lib/constants'

export function createDOMEvent(event) {
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
    selector,
    type: EVENT_TYPES.BASE,
    ...(value !== null && { value }),
    ...(textContent !== null && { textContent }),
    ...(target.name !== null && { name: target.name }),
    ...(target.baseURI !== null && { baseURI: target.baseURI }),
    ...(target.type !== null && { targetType: target.type }),
  }

  return {
    eventDetails,
    eventKey,
  }
}
