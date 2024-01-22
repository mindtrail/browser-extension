import { HIGHLIGHT_CLASS } from '~/lib/constants'

// Used same approach as https://github.com/jeromepl/highlighter for the range selector
/**
 * STEPS:
 * 1 - Use the offset of the startContainer to find the start of the selected text
 *     - Use the first of the anchor of the focus elements to appear
 * 2 - From there, go through the elements and find all Text Nodes until the selected text is all found.
 *     - Wrap all the text nodes (or parts of them) in a span DOM element with special highlight class name and bg color
 * 3 - Deselect text
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

  const { startContainer, commonAncestorContainer } = selector.range

  const container = getDOMElementFromIdentifier(commonAncestorContainer)
  console.log(container)
  // Get the child nodes of the container
  const childNodes = [] // [...commonAncestorContainer.childNodes]

  childNodes.forEach((element) => {
    if (charsHighlighted >= clippingLength) return

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
function getNonStandardElements(query) {
  try {
    return document.querySelector(query)
  } catch (error) {
    // It is possible that this query fails because of an invalid CSS selector that actually exists in the DOM.
    // This was happening for example here: https://lawphil.net/judjuris/juri2013/sep2013/gr_179987_2013.html
    // where there is a tag <p"> that is invalid in HTML5 but was still rendered by the browser
    // In this case, manually find the element:
    let element = document
    for (const queryPart of query.split('>')) {
      if (!element) return null

      const re = /^(.*):nth-of-type\(([0-9]+)\)$/iu
      const result = re.exec(queryPart)
      const [, tagName, index] = result || [undefined, queryPart, 1]
      element = Array.from(element.childNodes).filter(
        (child) => child.localName === tagName,
      )[index - 1]
    }
    return element
  }
}

function getDOMElementFromIdentifier(identifier: string) {
  if (identifier.startsWith('#')) {
    const id = identifier.substring(1) // Get text after '#'
    return document.getElementById(id)
  }

  // Start from the BODY element to build the XPath
  let element = document.body
  const queryParts = identifier.split('/')

  for (const part of queryParts) {
    if (!part) continue // Skip empty parts

    const matches = part.match(/^(.+)\[(\d+)\]$/) // Match nodeName[index]
    if (!matches) return null // Invalid part format

    const [, nodeName, indexStr] = matches
    const index = parseInt(indexStr, 10) - 1 // Convert to 0-based index

    const childNodes = Array.from(element.childNodes).filter(
      (child) =>
        (child.nodeType === Node.TEXT_NODE ? 'text' : child.nodeName.toLowerCase()) ===
        nodeName,
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
