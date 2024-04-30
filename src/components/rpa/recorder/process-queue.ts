// let lastEventTime = 0
let eventQueue = []
let processingQueue = false
let debounceTimers = new Map()

// export function resetTime() {
//   lastEventTime = 0
// }

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

export function debounceEvent(eventKey, event, callback, debounceDuration = 300) {
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
