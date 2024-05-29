import { getContent } from '~/lib/recorder-utils/get-content'
import { getValue } from '~/lib/recorder-utils/get-value'
import { EVENT_TYPES } from '~/lib/constants'

interface BaseEventProps {
  event: any
  selector?: string
  type: string
}

export function createBaseEvent({ event = {}, selector, type }: BaseEventProps) {
  const { target = {}, url } = event

  const timeStamp = Date.now()

  const eventIdentifier = type === EVENT_TYPES.NAV ? url : selector
  const eventKey = `${type}-${eventIdentifier}`

  const value = type === EVENT_TYPES.NAV ? url : getValue({ type, target })
  const textContent = getContent({ type, target })

  const eventDetails = {
    id: `${timeStamp}`,
    eventKey,
    type,
    ...(selector && { selector }),
    ...(value !== null && { value }),
    ...(textContent !== null && { textContent }),
    ...(target.name !== null && { name: target.name }),
    ...(target.baseURI !== null && { baseURI: target.baseURI }),
    ...(target.type !== null && { targetType: target.type }),
  }

  return {
    eventKey,
    eventDetails,
  }
}
