import { waitForUrl } from '../wait-for-url'
import { waitForElement } from '../wait-for-element'

async function triggerInputEvent(event) {
  try {
    if (event.baseURI) {
      const urlMatch = await waitForUrl(event.baseURI)
      if (!urlMatch) window.location.href = event.baseURI
    }

    const element: any = await waitForElement(event.selector)
    if (!element) return

    let nativeInputValueSetter
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        element.constructor.prototype,
        'value',
      ).set

      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(element, event.value)
        element.dispatchEvent(new Event('input', { bubbles: true }))
      }
    }
  } catch (error) {
    console.error('Error triggering input event:', error)
    throw error
  }
}

const delay = 10
export async function inputComponent({ flowId, event, data, onEventStart, onEventEnd }) {
  await onEventStart(flowId, event)
  event.value = data[event.name] || event.value
  await new Promise((resolve) => setTimeout(resolve, delay))
  await triggerInputEvent(event)
  await new Promise((resolve) => setTimeout(resolve, delay))
  await onEventEnd(flowId, event)
}
