import { waitForUrl } from '../wait-for-url'
import { waitForElement } from '../wait-for-element'

async function triggerClickEvent(event, callback) {
  try {
    if (event.baseURI) {
      const urlMatch = await waitForUrl(event.baseURI)
      if (!urlMatch) window.location.href = event.baseURI
    }

    const element: any = await waitForElement(event.selector)
    if (!element) {
      await callback()
      if (event.href) window.location.href = event.href
      return
    }

    await callback()
    element.click()
    // const clickEvent = new MouseEvent('click', { bubbles: true, composed: true })
    // element.dispatchEvent(clickEvent)
  } catch (error) {
    console.error('Error triggering click event:', error)
    throw error
  }
}

const delay = 10
export async function clickComponent({ flowId, event, onEventStart, onEventEnd }) {
  await onEventStart(flowId, event)
  await new Promise((resolve) => setTimeout(resolve, delay))
  await triggerClickEvent(event, async () => {
    await onEventEnd(flowId, event)
  })
}
