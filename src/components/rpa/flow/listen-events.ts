import findSelector from './find-selector'

const eventHandler = (callback) => (event) => {
  const { type, target } = event
  const selector = findSelector(target)
  console.log(selector)
  console.log('')

  let value = null
  if (
    type === 'input' &&
    (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)
  ) {
    value = target.value
  }

  if (selector) {
    callback({ type, selector, delay: 500, ...(value !== null && { value }) })
  }
}

export default function listenEvents(callback) {
  const clickHandler = eventHandler(callback)
  const inputHandler = eventHandler(callback)

  document.addEventListener('click', clickHandler)
  document.addEventListener('input', inputHandler)

  return () => {
    document.removeEventListener('click', clickHandler)
    document.removeEventListener('input', inputHandler)
  }
}
