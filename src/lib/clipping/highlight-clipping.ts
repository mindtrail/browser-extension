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
  clippingList.forEach((clipping, index) => {
    console.log(index)
    let { selector } = clipping
    // selector comes serialized from the DB
    selector = typeof selector === 'string' ? JSON.parse(selector) : selector

    const { range } = selector || {}

    if (!range) {
      console.error('Failed to highlight clipping 123', clipping)
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

    // If selection is only inside a single element, directly handle it
    if (startPath === endPath && startPath && parentPath) {
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

    console.log(33333, highlightPayload, parentContainer)
    if (index === 0) return
    // If we don't have the parentConainter, the star&end won't be there implicitly
    const successfullyHighlighet = parentContainer
      ? wrapClippingTextInSpan(parentContainer, highlightPayload)
      : false

    if (!successfullyHighlighet) {
      // console.error('Failed to highlight clipping 333', clipping)
      // @TODO: try 2nd approach
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
  charsHighlighted = 0
) {
  const { content, startContainer, endContainer, startOffset, endOffset } = clipping
  const clippingLength = content?.length

  const childNodes = [...parentContainer.childNodes]
  childNodes.forEach((element: Node) => {
    if (charsHighlighted >= clippingLength) {
      return
    }

    if (startContainer === parentContainer && startContainer === endContainer) {
    }

    // If we haven't found the start yet, skip text node
    if (element.nodeType === Node.TEXT_NODE) {
      if (!startFound) {
        if (element !== startContainer) {
          return
        }
        startFound = true

        if (startContainer === endContainer) {
          const textToHighlight = (element as Text).splitText(startOffset)
          const span = document.createElement('span')
          span.classList.add(HIGHLIGHT_CLASS)
          span.textContent = textToHighlight.textContent
          element.parentNode?.insertBefore(span, textToHighlight)
          return
        }
        // console.log(11111, element)
      }

      const startIndex = element === startContainer ? startOffset : 0
      const endIndex = element === endContainer ? endOffset : element.textContent?.length

      console.log(element)
      const textToHighlight = (element as Text)?.splitText(startIndex)
      console.log(2222, textToHighlight)
      // Text nodes represent the content
    }

    // Element nodes represent containers -> recurseive call to find text nodes
    if (element.nodeType === Node.ELEMENT_NODE) {
      const { visibility, display } = window.getComputedStyle(element as Element)
      const elementNotVisible = visibility === 'hidden' || display === 'none'

      if (elementNotVisible) {
        return
      }

      const response = wrapClippingTextInSpan(
        element,
        clipping,
        startFound,
        charsHighlighted
      )

      if (response) {
        startFound = response.startFound
        charsHighlighted = response.charsHighlighted
      }

      return
    }
  })

  return { startFound, charsHighlighted }
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

  const textToHighlight = startOffset > 0 ? textNode.splitText(startOffset) : textNode

  if (endOffset < totalNodeLenght) {
    textToHighlight.splitText(endOffset)
  }

  const span = document.createElement('span')
  span.classList.add(HIGHLIGHT_CLASS)
  span.textContent = textToHighlight.textContent

  node.parentNode?.replaceChild(span, textToHighlight)
}
