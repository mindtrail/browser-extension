interface BaseEventProps {
  event: any
  selector?: string
  type: string
}

export function createBaseEvent({ event, selector, type }: BaseEventProps) {
  const { target = {} } = event

  const timeStamp = Date.now()

  const eventKey = `${type}-${selector}`
  const eventDetails = {
    id: `${timeStamp}`,
    eventKey,
    selector,
    type,
    ...(target.name !== null && { name: target.name }),
    ...(target.baseURI !== null && { baseURI: target.baseURI }),
    ...(target.type !== null && { targetType: target.type }),
  }

  return {
    eventKey,
    eventDetails,
  }
}
