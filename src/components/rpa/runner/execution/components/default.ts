export function simulateEvent(event) {
  const element = document.querySelector(event.selector)
  if (!element) {
    if (event.href) window.location.href = event.href
    return
  }

  try {
    if (event.type === 'input') {
      let nativeInputValueSetter
      if (element instanceof HTMLInputElement) {
        nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value',
        ).set
      } else if (element instanceof HTMLTextAreaElement) {
        nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype,
          'value',
        ).set
      }

      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(element, event.value)
        element.dispatchEvent(new Event('input', { bubbles: true }))
      }
    } else if (event.type === 'click') {
      element.click()
      // const clickEvent = new MouseEvent('click', { bubbles: true, composed: true })
      // element.dispatchEvent(clickEvent)
    }
  } catch (error) {
    console.error('Error simulating event:', error)
  }
}

// const delay = 250
const delay = 1000

export async function defaultComponent({
  flowId,
  event,
  data,
  onEventStart,
  onEventEnd,
}) {
  await onEventStart(flowId, event)
  event.value = data[event.name] || event.value
  await new Promise((resolve) => setTimeout(resolve, delay))
  simulateEvent(event)
  await new Promise((resolve) => setTimeout(resolve, delay))
  await onEventEnd(flowId, event)
}
