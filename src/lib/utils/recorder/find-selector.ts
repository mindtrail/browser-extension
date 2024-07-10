function getElementSelector(el) {
  let selector = el.tagName.toLowerCase()
  const whitelist = ['name', 'data-*', 'role', 'title', 'alt', 'href', 'type']
  let hasValidAttr = false

  whitelist.forEach((attr) => {
    if (attr === 'data-*') {
      Array.from(el.attributes).forEach((attribute: any) => {
        if (attribute.name.startsWith('data-')) {
          selector += `[${attribute.name}="${attribute.value}"]`
          hasValidAttr = true
        }
      })
    } else if (el.hasAttribute(attr)) {
      selector += `[${attr}="${el.getAttribute(attr)}"]`
      hasValidAttr = true
    }
  })

  return hasValidAttr ? selector : null
}

export function getSelector(element, limit = 2) {
  let path = []
  let currentElement = element
  let isTargetElement = true
  let pathCount = 0

  while (currentElement) {
    const selector = getElementSelector(currentElement)
    if (selector || isTargetElement) {
      path.unshift(selector || currentElement.tagName.toLowerCase())
      if (selector) {
        pathCount++
      }
    }
    isTargetElement = false
    if (currentElement.tagName.toLowerCase() === 'body' || pathCount >= limit) {
      break
    }
    currentElement = currentElement.parentElement
  }

  const pathStr = path.join(' ')
  console.log(pathStr)
  return pathStr
}

export function getSelectors(element) {
  // Array to store the selectors
  let selectors = []

  // Helper function to recursively traverse the DOM
  function traverseDom(element) {
    if (!element) return

    // Check if the element is an input or button
    if (
      element.tagName.toLowerCase() === 'input' ||
      element.tagName.toLowerCase() === 'button'
    ) {
      // Call the existing getSelector function and store the selector
      const selector = getSelector(element)
      selectors.push(selector)
    }

    // Recursively traverse child elements
    for (let child of element.children) {
      traverseDom(child)
    }
  }

  // Start traversing from the given element
  traverseDom(element)

  // Return the array of selectors
  return selectors
}
