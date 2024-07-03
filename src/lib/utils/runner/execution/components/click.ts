import { waitForUrl } from '~/lib/utils/runner/wait-for-url'
import { waitForElement } from '~/lib/utils/runner/wait-for-element'

async function triggerClickEvent(event, callback) {
  try {
    if (event.baseURI) {
      const urlMatch = await waitForUrl(event.baseURI)
      // if (!urlMatch) {
      //   window.location.href = event.baseURI
      // }
    }

    const element: any = await waitForElement(event.selector)
    if (!element) {
      await callback()
      if (event.href) {
        window.location.href = event.href
      }
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

export async function clickComponent(props: RunnerComponentProps) {
  const { flowId, event, onEventStart, onEventEnd, task } = props

  console.log(2222, props)

  await onEventStart({ flowId, event, taskId: task.id })
  await triggerClickEvent(event, () => onEventEnd({ event, taskId: task.id }))
}
