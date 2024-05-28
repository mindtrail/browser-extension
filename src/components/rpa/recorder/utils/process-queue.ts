import { EVENT_TYPES } from './constants'

let eventQueue = []
let processingQueue = false
let debounceTimers = new Map()

export function processEvent(event, callback) {
  // const delay = lastEventTime ? event.timeStamp - lastEventTime : 0
  // console.log(`Processing event: ${event.type} at ${event.selector} with delay ${delay}`)
  // lastEventTime = event.timeStamp
  callback({ ...event })
}

export function processNextEvent() {
  if (eventQueue.length === 0) {
    processingQueue = false
    return
  }
  const { event, callback } = eventQueue.shift()
  processEvent(event, callback)
  processNextEvent()
}

export function processQueue() {
  if (processingQueue || eventQueue.length === 0) return
  processingQueue = true
  processNextEvent()
}

export function debounceEvent(eventKey, event, callback, debounceDuration = 1000) {
  // Process immediately
  if (
    event.type === EVENT_TYPES.URL ||
    (event.type === EVENT_TYPES.CLICK && event.href)
  ) {
    eventQueue.push({ event, callback })
    processQueue()
    return
  }

  if (debounceTimers.has(eventKey)) {
    clearTimeout(debounceTimers.get(eventKey))
  }

  debounceTimers.set(
    eventKey,
    setTimeout(() => {
      eventQueue.push({ event, callback })
      processQueue()
      debounceTimers.delete(eventKey)
    }, debounceDuration),
  )
}
