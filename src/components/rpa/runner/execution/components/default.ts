async function waitForUrl(baseURI, timeout = 2000, interval = 100) {
  const cleanBaseURI = baseURI.split('?')[0].split('#')[0]
  const endTime = Date.now() + timeout
  return new Promise((resolve) => {
    const checkUrl = () => {
      if (window.location.href.includes(cleanBaseURI)) {
        resolve(true)
      } else if (Date.now() > endTime) {
        window.location.href = baseURI
      } else {
        setTimeout(checkUrl, interval)
      }
    }
    checkUrl()
  })
}

async function waitForElement(selector, timeout = 10000, interval = 100) {
  const endTime = Date.now() + timeout
  return new Promise((resolve, reject) => {
    const checkElement = () => {
      const element = document.querySelector(selector)
      if (element) {
        resolve(element)
      } else if (Date.now() > endTime) {
        reject(
          new Error(
            `Element with selector "${selector}" not found within the timeout period`,
          ),
        )
      } else {
        setTimeout(checkElement, interval)
      }
    }
    checkElement()
  })
}

export async function simulateEvent(event) {
  try {
    await waitForUrl(event.baseURI)
    const element: any = await waitForElement(event.selector)
    if (!element) {
      if (event.href) window.location.href = event.href
      return
    }
    if (event.type === 'input') {
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
    } else if (event.type === 'click') {
      element.click()
      // const clickEvent = new MouseEvent('click', { bubbles: true, composed: true })
      // element.dispatchEvent(clickEvent)
    }
  } catch (error) {
    console.error('Error simulating event:', error)
    throw error
  }
}

const delay = 500
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
  await simulateEvent(event)
  await new Promise((resolve) => setTimeout(resolve, delay))
  await onEventEnd(flowId, event)
}
