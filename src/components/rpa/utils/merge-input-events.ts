export function mergeInputEvents(events = []) {
  const filteredEvents = []
  let lastEvent = null

  // @Todo input add value & initialValue => value !== initialValue
  events = events.filter(({ type, value }) => type !== 'input' || value)
  events.forEach((event) => {
    if (
      event?.type === 'input' &&
      lastEvent?.type === 'input' &&
      lastEvent?.selector === event?.selector
    ) {
      lastEvent = { ...event }
    } else {
      if (lastEvent) {
        filteredEvents.push(lastEvent)
      }
      lastEvent = { ...event }
    }
  })

  if (lastEvent) {
    filteredEvents.push(lastEvent)
  }
  return filteredEvents
}
