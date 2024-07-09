export async function waitForElement(selector, timeout = 5000, interval = 100) {
  const endTime = Date.now() + timeout
  return new Promise((resolve, reject) => {
    const checkElement = () => {
      const element = document.querySelector(selector.default)
      if (element) {
        resolve(element)
      } else if (Date.now() > endTime) {
        reject(
          new Error(
            `Element with selector "${selector.default}" not found within the timeout period`,
          ),
        )
      } else {
        setTimeout(checkElement, interval)
      }
    }
    checkElement()
  })
}
