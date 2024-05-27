export async function waitForElement(selector, timeout = 10000, interval = 100) {
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
