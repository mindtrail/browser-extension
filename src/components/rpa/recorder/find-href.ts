export function findHref(element) {
  let href = null
  let currentElement = element
  for (let i = 0; i < 3; i++) {
    if (currentElement instanceof HTMLAnchorElement && currentElement.href) {
      href = currentElement.href
      break
    }
    currentElement = currentElement.parentElement
    if (!currentElement) break
  }
  return href
}
