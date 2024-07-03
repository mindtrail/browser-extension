import { waitForUrl } from '~/lib/utils/runner/wait-for-url'
import { waitForElement } from '~/lib/utils/runner/wait-for-element'

async function triggerInputEvent(event) {
  try {
    if (event.baseURI) {
      const urlMatch = await waitForUrl(event.baseURI)
      // if (!urlMatch) window.location.href = event.baseURI
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

export async function inputComponent(props: RunnerComponentProps) {
  const { flowId, task, event, data, onEventStart, onEventEnd } = props
  event.value = data[event.name] || data[event.event_name] || event.value

  await onEventStart({ flowId, event, taskId: task.id })
  await triggerInputEvent(event)
  await onEventEnd({ flowId, event, taskId: task.id })
}
