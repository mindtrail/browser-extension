import { getSelector } from './find-selector'
import { getHref } from './find-href'
import { getValue } from './get-value'
import { getContent } from './get-content'
import { debounceEvent } from './process-queue'
import { detectRageClicks } from '../utils/filter-events'

function eventHandler(callback) {
  return (event) => {
    const { type, target } = event
    const selector = getSelector(target)

    if (!target || (selector && selector?.includes('plasmo-csui'))) {
      return
    }

    // Skip click events in input fields
    if (
      type === 'click' &&
      (target?.nodeName === 'INPUT' || target?.nodeName === 'TEXTAREA')
    ) {
      return
    }

    const href = type === 'click' ? getHref(target) : null
    const value = getValue({ type, target })
    const textContent = getContent({ type, target })
    const timeStamp = Date.now()
    const eventKey = `${type}-${selector}-${timeStamp}`

    const eventDetails = {
      id: `${timeStamp}`,
      type,
      selector,
      ...(value !== null && { value }),
      ...(textContent !== null && { textContent }),
      ...(target.name !== null && { name: target.name }),
      ...(target.baseURI !== null && { baseURI: target.baseURI }),
      ...(href !== null && { href }),
    }

    debounceEvent(eventKey, eventDetails, callback)
  }
}

let handler = null

export function listenEvents(callback, shouldListen) {
  if (!handler) {
    handler = eventHandler(callback)
  }

  if (shouldListen) {
    document.addEventListener('click', handler)
    document.addEventListener('input', handler)
  } else {
    document.removeEventListener('click', handler)
    document.removeEventListener('input', handler)
    handler = null
  }

  return () => {
    document.removeEventListener('click', handler)
    document.removeEventListener('input', handler)
    handler = null // Reset handler after removing listeners
  }
}
