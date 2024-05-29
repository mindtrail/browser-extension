export function getStartDependencies(events, event) {
  let lastHrefEvent = null
  for (let i = events.length - 1; i >= 0; i--) {
    if (events[i].href) {
      lastHrefEvent = events[i]
      break
    }
  }
  return lastHrefEvent && !event.href ? [lastHrefEvent.id] : []
}

export function getEndDependencies(events, event) {
  const lastEvent = events[events.length - 1]
  return lastEvent?.id !== event.id && !event.href ? [lastEvent.id] : []
}
