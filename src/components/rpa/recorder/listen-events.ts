import { findSelector } from './find-selector'
import { findHref } from './find-href'
import { debounceEvent } from './process-queue'

function eventHandler(callback) {
  return (event) => {
    const { type, target } = event
    const selector = findSelector(target)
    const href = type === 'click' ? findHref(target) : null
    const value =
      type === 'input' &&
      (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)
        ? target.value
        : null
    const textContent =
      type === 'click'
        ? target.innerText
          ? target.innerText.trim()
          : target.tagName
        : null
    const currentTimeStamp = Date.now()

    if (selector && !selector.includes('plasmo-csui')) {
      const eventKey = `${type}-${selector}`
      const eventDetails = {
        type,
        selector,
        timeStamp: currentTimeStamp,
        ...(value !== null && { value }),
        ...(textContent !== null && { textContent }),
        ...(target.name !== null && { name: target.name }),
        ...(target.baseURI !== null && { baseURI: target.baseURI }),
        ...(href !== null && { href }),
      }
      debounceEvent(eventKey, eventDetails, callback)
    }
  }
}

export function listenEvents(callback, shouldListen) {
  const handler = eventHandler(callback)

  if (shouldListen) {
    document.addEventListener('click', handler)
    document.addEventListener('input', handler)
  } else {
    document.removeEventListener('click', handler)
    document.removeEventListener('input', handler)
  }

  return () => {
    document.removeEventListener('click', handler)
    document.removeEventListener('input', handler)
  }
}
