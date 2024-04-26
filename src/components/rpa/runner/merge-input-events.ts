export function mergeInputEvents(events) {
  const mergedEvents = []
  let lastEvent = null
  events.forEach((event) => {
    if (
      event.type === 'input' &&
      lastEvent &&
      lastEvent.type === 'input' &&
      lastEvent.selector === event.selector
    ) {
      lastEvent = { ...event }
    } else {
      if (lastEvent) {
        mergedEvents.push(lastEvent)
      }
      lastEvent = { ...event }
    }
  })
  if (lastEvent) {
    mergedEvents.push(lastEvent)
  }
  return mergedEvents
}
