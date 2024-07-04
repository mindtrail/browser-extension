import { waitForUrl } from '~/lib/utils/runner/wait-for-url'
import { waitForElement } from '~/lib/utils/runner/wait-for-element'

export async function inputComponent({ event, data }: RunnerComponentProps) {
  event.value = data[event.name] || data[event.event_name] || event.value
  try {
    if (event.baseURI) {
      const urlMatch = await waitForUrl(event.baseURI)
      // if (!urlMatch) window.location.href = event.baseURI
    }

    const element: any = await waitForElement(event.selector)
    if (!element) return

    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
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
