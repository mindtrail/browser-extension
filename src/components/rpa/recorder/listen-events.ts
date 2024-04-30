import { getSelector } from './find-selector'
import { getHref } from './find-href'
import { getValue } from './get-value'
import { getContent } from './get-content'
import { debounceEvent } from './process-queue'

function eventHandler(callback) {
  return (event) => {
    const { type, target } = event
    const selector = getSelector(target)
    const href = type === 'click' ? getHref(target) : null
    const value = getValue({ type, target })
    const textContent = getContent({ type, target })
    // const timeStamp = Date.now()

    if (selector && !selector.includes('plasmo-csui')) {
      const eventKey = `${type}-${selector}`
      const eventDetails = {
        type,
        selector,
        // timeStamp,
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
