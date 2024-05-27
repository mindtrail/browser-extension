function cleanUrl(url) {
  return url.split('?')[0].split('#')[0]
}

export async function waitForUrl(baseURI, timeout = 3000, interval = 100) {
  const cleanBaseURI = cleanUrl(baseURI)
  const endTime = Date.now() + timeout

  return new Promise((resolve) => {
    const checkUrl = () => {
      const currentUrl = cleanUrl(window.location.href)
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
