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

type HighlightRange = {
  startNodeEl: HTMLElement
  endNodeEl: HTMLElement
  startOffset: number
  endOffset: number
  content: string
}

let startFound = false
let endFound = false
let charsHighlighted = 0

export function highlightClippings(clippingList: SavedClipping[]) {
  // Step 1 + 2:
  clippingList.forEach((clipping) => {
    try {
      let { selector, content } = clipping
      // Selector comes serialized from the DB
      selector = typeof selector === 'string' ? JSON.parse(selector) : selector

      let {
        startContainer,
        endContainer,
        commonAncestorContainer,
        startOffset,
        endOffset,
      } = selector.range

      const parentNodeEl = getDOMElementFromIdentifier(commonAncestorContainer)

      if (!parentNodeEl) {
        throw new Error('Parent node not found')
      }

      // If selection is only inside a single element, handle it directly
      if (startContainer === commonAncestorContainer && parentNodeEl) {
        return splitTextAndAddSpan(parentNodeEl, startOffset, endOffset)
      }

      const startNodeEl = getDOMElementFromIdentifier(startContainer)
      const endNodeEl = getDOMElementFromIdentifier(endContainer)

      const highlightRange: HighlightRange = {
        startNodeEl,
        endNodeEl,
        startOffset,
        endOffset,
        content,
      }

      startFound = false
      endFound = false
      charsHighlighted = 0

      const success = recursiveNodeProcess(parentNodeEl, highlightRange)

      if (!success) {
        throw new Error('Failed to highlight clipping')
      }
    } catch (error) {
      // @TODO: try 2nd approach... of searchgin by text + surrounding, not only range
      console.error(error, clipping)
    }
  })
}

function recursiveNodeProcess(rootEl: Node, highlightRange: HighlightRange) {
  const { content, startNodeEl, endNodeEl, startOffset, endOffset } = highlightRange
  const clippingLength = content?.length

  const childNodes = [...rootEl.childNodes]

  childNodes.forEach((element: Node) => {
    if (charsHighlighted >= clippingLength || endFound) {
      return
    }

    // Element nodes represent containers -> recurseive call on the visible nodes
    if (element.nodeType === Node.ELEMENT_NODE) {
      const { visibility, display } = window.getComputedStyle(element as Element)
      if (visibility !== 'hidden' && display !== 'none') {
        return recursiveNodeProcess(element, highlightRange)
      }
      return
    }

    // Text nodes represent the content
    if (element.nodeType === Node.TEXT_NODE) {
      // If start not found, skip node
      if (!startFound && element !== startNodeEl) {
        return
      }

      const startIndex = startFound ? 0 : startOffset

      endFound = element === endNodeEl
      const endIndex = endFound ? endOffset : element.textContent?.length ?? 0
      charsHighlighted += splitTextAndAddSpan(element, startIndex, endIndex)

      startFound = true
    }
  })

  return charsHighlighted
}

function getDOMElementFromIdentifier(identifier: string) {
  if (!identifier) {
    return null
  }

  let DOMElement = document.body
  const pathArray = identifier.split('/')

  for (const part of pathArray) {
    if (!part) {
      continue // Skip empty parts
    }

    if (part.startsWith('#') && !part.startsWith('#text')) {
      // If part is an ID selector, find the element by ID
      const id = part.substring(1)
      DOMElement = document.getElementById(id)
      if (!DOMElement) {
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

    const childNodes = [...DOMElement.childNodes].filter(
      (child) => child.nodeName === nodeName
    )

    DOMElement = childNodes[index] as HTMLElement

    if (!DOMElement) {
      return null // Element not found
    }
  }

  return DOMElement
}

function splitTextAndAddSpan(node: Node, startOffset: number, endOffset: number) {
  const textNode = node as Text
  const totalNodeLenght = textNode.textContent?.length

  // SplitText splits the text node in 2, and returns the new node after the offset
  const textToHighlight = startOffset > 0 ? textNode.splitText(startOffset) : textNode

  // If selection is shorter than the text item, split it again
  if (endOffset < totalNodeLenght) {
    textToHighlight.splitText(endOffset - startOffset)
  }

  const nrOfCharsToHighlight = textToHighlight.textContent?.length

  const span = document.createElement('span')
  span.classList.add(HIGHLIGHT_CLASS)
  span.textContent = textToHighlight.textContent

  node.parentNode?.replaceChild(span, textToHighlight)

  return nrOfCharsToHighlight
}
