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
    let { selector } = clipping
    // Selector comes serialized from the DB
    selector = typeof selector === 'string' ? JSON.parse(selector) : selector

    const { range } = selector || {}
    if (!range) {
      console.error('Failed to highlight clipping', clipping)
      return
    }

    let {
      startContainer: startPath,
      endContainer: endPath,
      commonAncestorContainer: parentPath,
      startOffset,
      endOffset,
    } = range

    const parentContainer = getDOMElementFromIdentifier(parentPath)

    // If selection is only inside a single element, handle it directly
    if (startPath === parentPath && parentContainer) {
      return splitTextAndAddSpan(parentContainer, startOffset, endOffset)
    }

    // Otherwise Start & End containers are children of commonAncestor
    startPath = startPath.substring(parentPath.length)
    endPath = endPath.substring(parentPath.length)

    const startContainer = getDOMElementFromIdentifier(startPath, parentContainer)
    const endContainer = getDOMElementFromIdentifier(endPath, parentContainer)

    const highlightPayload: HighlightRange = {
      startContainer,
      startOffset,
      endContainer,
      endOffset,
      content: clipping.content,
    }

    // If we don't have the parentConainter, the star&end won't be there implicitly
    const successfullyHighlighet = parentContainer
      ? wrapClippingTextInSpan(parentContainer, highlightPayload)
      : false

    if (!successfullyHighlighet) {
      // @TODO: try 2nd approach...
      return
    }
  })
}

type HighlightRange = {
  startContainer: HTMLElement
  endContainer: HTMLElement
  startOffset: number
  endOffset: number
  content: string
}

function wrapClippingTextInSpan(
  parentContainer: Node,
  clipping: HighlightRange,
  startFound = false,
  endFound = false,
  charsHighlighted = 0
): [boolean, boolean, number] | null {
  const { content, startContainer, endContainer, startOffset, endOffset } = clipping
  const clippingLength = content?.length

  const childNodes = [...parentContainer.childNodes]

  childNodes.forEach((element: Node) => {
    console.log(endFound, charsHighlighted, clippingLength)
    if (charsHighlighted >= clippingLength || endFound) {
      return
    }

    // Element nodes represent containers -> recurseive call to find text nodes
    if (element.nodeType === Node.ELEMENT_NODE) {
      const { visibility, display } = window.getComputedStyle(element as Element)

      if (visibility === 'hidden' || display === 'none') {
        return
      }

      // Update startFound while going recursivelly
      ;[startFound, endFound, charsHighlighted] = wrapClippingTextInSpan(
        element,
        clipping,
        startFound,
        endFound,
        charsHighlighted
      )
      return
    }

    // Text nodes represent the content
    if (element.nodeType === Node.TEXT_NODE) {
      // If start not found, skip node
      if (!startFound && element !== startContainer) {
        return
      }

      const startIndex = startFound ? 0 : startOffset

      endFound = element === endContainer
      const endIndex = endFound ? endOffset : element.textContent?.length ?? 0
      charsHighlighted += splitTextAndAddSpan(element, startIndex, endIndex)

      startFound = true
    }
  })

  return [startFound, endFound, charsHighlighted]
}

function getDOMElementFromIdentifier(
  identifier: string,
  startDOMElement: HTMLElement = document.body
) {
  if (!identifier) {
    return null
  }

  let DOMElement = startDOMElement

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
