import { getValue } from '~lib/utils/recorder/get-value'
import { ACTION_TYPE } from '~/lib/constants'

interface BaseEventProps {
  event: any
  selector?: { default: string; llm?: string }
  type: string
}

export function createBaseEvent({ event = {}, selector, type }: BaseEventProps) {
  const { target = {}, url } = event

  const timeStamp = Date.now()

  const eventIdentifier = type === ACTION_TYPE.NAV ? url : selector.default
  const eventKey = `${type}-${eventIdentifier}`

  const value = type === ACTION_TYPE.NAV ? url : getValue({ type, target })

  const eventDetails = {
    id: `${timeStamp}`,
    eventKey,
    type,
    ...(selector && { selector }),
    ...(value !== null && { value }),
    ...(target.name !== null && { name: target.name }),
    ...(target.baseURI !== null && { baseURI: target.baseURI }),
    ...(target.type !== null && { targetType: target.type }),
  }

  return {
    eventKey,
    eventDetails,
  }
}
