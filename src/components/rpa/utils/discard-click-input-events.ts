export function discardClickInputEvents(events) {
  const groupedEvents = []
  let previousEvent = null

  events.forEach((event) => {
    if (
      previousEvent?.type === 'click' &&
      event?.type === 'input' &&
      previousEvent?.selector === event?.selector
    ) {
      groupedEvents.push({ ...event })
      previousEvent = null
    } else {
      if (previousEvent) {
        groupedEvents.push(previousEvent)
      }
      previousEvent = event
    }
  })

  if (previousEvent) {
    groupedEvents.push(previousEvent)
  }

  return groupedEvents
}
