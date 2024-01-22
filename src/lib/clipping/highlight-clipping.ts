import { HIGHLIGHT_CLASS } from '~/lib/constants'

// Used same approach as https://github.com/jeromepl/highlighter for the range selector
/**
 * STEPS:
 * 1 - From the startContainer & it's offset,  find the start of the clipping
 * 2 - Find all Nodes until the selection is covered.
 *   -> Wrap them text nodes (or parts of them) in a span DOM element.
 * 3 - Clear selection
 * 4 - Attach mouse hover event listeners to display tools when hovering a highlight
 */
export function highlightClippings(clippingList: SavedClipping[]) {
  // Step 1 + 2:
  clippingList.forEach((clipping) => {
    // Wrap the text nodes in a span with the highlight class
    wrapClipping(clipping)
  })
}

function wrapClipping(clipping: SavedClipping, startFound = false, charsHighlighted = 0) {
  // container, highlightInfo, startFound, charsHighlighted
  const { content, selector: selectorString } = clipping
  const clippingLength = content?.length

  if (!clippingLength) {
    return
  }

  // @ts-ignore -> in the DB it's serialized, so the return is a string
  const selector = JSON.parse(selectorString as string) as ClippingSelector
  console.log('selector', selector)
  console.log('content', clippingLength, content)

  const { startContainer, commonAncestorContainer } = selector.range

  const parentContainer = getDOMElementFromIdentifier(commonAncestorContainer)
  console.log(parentContainer)
  const start = getDOMElementFromIdentifier(startContainer)
  console.log(start)
  if (!parentContainer) {
    return
  }

  // Get the child nodes of the container
  const childNodes = [] // [...commonAncestorContainer.childNodes]

  childNodes.forEach((element) => {
    if (charsHighlighted >= clippingLength) {
      return
    }

    // Skip non-text nodes and invisible nodes
    if (element.nodeType !== Node.TEXT_NODE) {
      if (element.nodeType === Node.ELEMENT_NODE && element.offsetParent !== null) {
        let computedStyle = window.getComputedStyle(element)
        if (computedStyle.visibility !== 'hidden') {
          let result = wrapClipping(element, highlightInfo, startFound, charsHighlighted)
          startFound = result[0]
          charsHighlighted = result[1]
        }
      }
      return
    }

    // ... rest of the code remains the same ...
  })

  return [startFound, charsHighlighted]
}

function getDOMElementFromIdentifier(identifier: string) {
  // The starting point for the xpath is the body element
  let element = document.body

  const pathArray = identifier.split('/')

  for (const part of pathArray) {
    if (!part) {
      continue // Skip empty parts
    }

    if (part.startsWith('#') && !part.startsWith('#text')) {
      // If part is an ID selector, find the element by ID
      const id = part.substring(1)
      element = document.getElementById(id)
      if (!element) {
        return null // Element with the specified ID not found
      }
      continue
    }

    const matches = part.match(/^(.+)\[(\d+)\]$/) // Match nodeName[index]
    if (!matches) {
      return null // Invalid part format
    }

    let [, nodeName, indexStr] = matches
    nodeName = nodeName === 'TEXT_NODE' ? '#text' : nodeName
    const index = parseInt(indexStr)

    const childNodes = [...element.childNodes].filter(
      (child) => child.nodeName === nodeName,
    )

    element = childNodes[index] as HTMLElement

    if (!element) {
      return null // Element not found
    }
  }

  return element
}

function escapeCSSString(cssString: string) {
  return cssString.replace(/(:)/gu, '\\$1')
}
