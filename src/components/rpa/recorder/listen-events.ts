import { findSelector } from './find-selector'

let lastEventTime = 0
let eventQueue = []
let processingQueue = false
let debounceTimers = new Map()

const processQueue = () => {
  if (processingQueue || eventQueue.length === 0) return
  processingQueue = true

  const processNextEvent = () => {
    if (eventQueue.length === 0) {
      processingQueue = false
      return
    }

    const { event, callback } = eventQueue.shift()
    const { type, selector, timeStamp, value, textContent, name } = event

    const delay = lastEventTime ? timeStamp - lastEventTime : 0
    console.log(`Processing event: ${type} at ${selector} with delay ${delay}`)
    lastEventTime = timeStamp

    callback({
      type,
      selector,
      delay,
      ...(value !== null && { value }),
      ...(textContent !== null && { textContent }),
      ...(name !== null && { name }),
    })
    processNextEvent()
  }

  processNextEvent()
}

const eventHandler = (callback, debounceDuration = 300) => {
  return (event) => {
    const { type, target } = event
    const selector = findSelector(target)

    let value = null
    let textContent = null
    if (
      type === 'input' &&
      (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)
    ) {
      value = target.value
    } else if (type === 'click') {
      textContent = target.innerText ? target.innerText.trim() : target.tagName
    }

    const currentTimeStamp = Date.now()

    if (selector && !selector.includes('plasmo-csui')) {
      const eventKey = `${type}-${selector}`
      if (debounceTimers.has(eventKey)) {
        clearTimeout(debounceTimers.get(eventKey))
      }

      debounceTimers.set(
        eventKey,
        setTimeout(() => {
          eventQueue.push({
            event: {
              type,
              selector,
              timeStamp: currentTimeStamp,
              ...(value !== null && { value }),
              ...(textContent !== null && { textContent }),
              ...(target.name !== null && { name: target.name }),
            },
            callback,
          })
          processQueue()
          debounceTimers.delete(eventKey)
        }, debounceDuration),
      )
    }
  }
}

export function listenEvents(callback, shouldListen) {
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
