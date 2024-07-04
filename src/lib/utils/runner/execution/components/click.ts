import { waitForUrl } from '~/lib/utils/runner/wait-for-url'
import { waitForElement } from '~/lib/utils/runner/wait-for-element'

export async function clickComponent({ event }: RunnerComponentProps) {
  try {
    if (event.baseURI) {
      const urlMatch = await waitForUrl(event.baseURI)
      // if (!urlMatch) {
      //   window.location.href = event.baseURI
      // }
    }

    const element: any = await waitForElement(event.selector)
    if (!element) {
      if (event.href) {
        window.location.href = event.href
      }
      return
    }

    element.click()
    // const clickEvent = new MouseEvent('click', { bubbles: true, composed: true })
    // element.dispatchEvent(clickEvent)
  } catch (error) {
    console.error('Error triggering click event:', error)
    throw error
  }
}
