import { findSelector } from './find-selector'

const eventHandler = (callback) => (event) => {
  const { type, target } = event
  const selector = findSelector(target)

  let value = null
  if (
    type === 'input' &&
    (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)
  ) {
    value = target.value
  }

  if (selector && !selector.includes('plasmo-csui')) {
    callback({ type, selector, delay: 500, ...(value !== null && { value }) })
  }
}

export default function listenEvents(callback) {
  const handler = eventHandler(callback)

  document.addEventListener('click', handler)
  document.addEventListener('input', handler)

  return () => {
    document.removeEventListener('click', handler)
    document.removeEventListener('input', handler)
  }
}
