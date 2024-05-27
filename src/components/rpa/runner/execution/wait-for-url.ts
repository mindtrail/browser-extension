export async function waitForUrl({ id, baseURI }, timeout = 2000, interval = 100) {
  const currentUrl = window.location.href.split('?')[0].split('#')[0]
  // const cleanBaseURI = baseURI.split('?')[0].split('#')[0]
  const cleanBaseURI = baseURI
  const endTime = Date.now() + timeout
  return new Promise((resolve) => {
    const checkUrl = () => {
      if (currentUrl === cleanBaseURI) {
        resolve(true)
      } else if (Date.now() > endTime) {
        resolve(false)
      } else {
        setTimeout(checkUrl, interval)
      }
    }
    checkUrl()
  })
}
