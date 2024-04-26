import { findSelector } from './find-selector'

let lastEventTime = 0
let eventQueue = []
let processingQueue = false

const processQueue = () => {
  if (processingQueue || eventQueue.length === 0) return
  processingQueue = true

  const processNextEvent = () => {
    if (eventQueue.length === 0) {
      processingQueue = false
      return
    }

    const { event, callback } = eventQueue.shift()
    const { type, selector, timeStamp, value } = event

    const delay = lastEventTime ? timeStamp - lastEventTime : 0
    console.log(`Processing event: ${type} at ${selector} with delay ${delay}`)
    lastEventTime = timeStamp // Update lastEventTime after processing

    callback({ type, selector, delay, ...(value !== null && { value }) })
    processNextEvent()
  }

  processNextEvent()
}

const eventHandler = (callback) => {
  return (event) => {
    const { type, target } = event
    const selector = findSelector(target)

    let value = null
    if (
      type === 'input' &&
      (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)
    ) {
      value = target.value
    }

    // Use Date.now() for the event timeStamp to ensure uniformity and avoid precision issues
    const currentTimeStamp = Date.now()

    if (selector && !selector.includes('plasmo-csui')) {
      eventQueue.push({
        event: {
          type,
          selector,
          timeStamp: currentTimeStamp,
          ...(value !== null && { value }),
        },
        callback,
      })
      processQueue()
    }
  }
}

export default function listenEvents(callback, shouldListen) {
  console.log('listenEvents', shouldListen)
  const handler = eventHandler(callback)

  const resetTimeHandler = () => {
    lastEventTime = 0
  }

  if (shouldListen) {
    document.addEventListener('click', handler)
    document.addEventListener('input', handler)
    window.addEventListener('reset-last-event-time', resetTimeHandler)
  } else {
    document.removeEventListener('click', handler)
    document.removeEventListener('input', handler)
    window.removeEventListener('reset-last-event-time', resetTimeHandler)
  }

  return () => {
    document.removeEventListener('click', handler)
    document.removeEventListener('input', handler)
    window.removeEventListener('reset-last-event-time', resetTimeHandler)
  }
}
