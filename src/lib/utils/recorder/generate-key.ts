export function generateKey(eventKey, lastKey, prevEvents = []) {
  let key = eventKey
  const lastEvent = prevEvents[prevEvents.length - 1]
  if (lastEvent && lastEvent.eventKey !== eventKey) {
    // create new key
    const i = prevEvents.filter((e) => e.eventKey.startsWith(eventKey)).length + 1
    key = `${eventKey}_${i}`
  } else if (lastEvent && lastEvent.eventKey === eventKey) {
    // reuse last key
    key = lastKey
  }
  return key
}
