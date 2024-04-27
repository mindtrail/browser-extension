export function simulateEvent(event) {
  const element = document.querySelector(event.selector)
  if (!element) return

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
    }
  } catch (error) {
    console.error('Error simulating event:', error)
  }
}
