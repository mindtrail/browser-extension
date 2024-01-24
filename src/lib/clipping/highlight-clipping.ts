import { HIGHLIGHT_CLASS, SPLIT_TEXTNODE_CLASS } from '~/lib/constants'

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
  startDOMEl: HTMLElement
  endDOMEl: HTMLElement
  startOffset: number
  endOffset: number
  content: string
}

export function highlightClippings(clippingList: SavedClipping[]) {
  // Step 1 + 2:
  clippingList.forEach((clipping) => {
    try {
      highlightClippingFromRange(clipping)
    } catch (error) {
      // @TODO: try 2nd approach... of searchgin by text + surrounding, not only range
      console.error(error, clipping)
    }
  })
}

function highlightClippingFromRange(clipping: SavedClipping) {
  let { selector, content } = clipping
  selector = parseSelector(selector)

  const { range } = selector
  const parentNodeEl = getDOMElementFromIdentifier(range.commonAncestorContainer)

  if (!parentNodeEl) {
    throw new Error('Parent node not found')
  }

  const {
    startContainer,
    endContainer,
    commonAncestorContainer,
    startOffset,
    endOffset,
  } = range

  if (startContainer === commonAncestorContainer) {
    return applyTextHighlight(parentNodeEl, startOffset, endOffset)
  }

  const startDOMEl = getDOMElementFromIdentifier(startContainer)
  const endDOMEl = getDOMElementFromIdentifier(endContainer)

  const highlightRange = {
    startDOMEl,
    endDOMEl,
    startOffset,
    endOffset,
    content,
  }

  const success = recursiveNodeProcess({ rootNode: parentNodeEl, highlightRange })

  if (!success) {
    throw new Error('Failed to highlight clipping from Range')
  }
}

interface RecursiveNodeProcess {
  rootNode: Node
  highlightRange: HighlightRange
  startFound?: boolean
  endFound?: boolean
  charsHighlighted?: number
}

type RecursiveResp = [boolean, boolean, number]

function recursiveNodeProcess(props: RecursiveNodeProcess): RecursiveResp {
  let {
    rootNode,
    highlightRange,
    startFound = false,
    endFound = false,
    charsHighlighted = 0,
  } = props

  const { content, startDOMEl, endDOMEl, startOffset, endOffset } = highlightRange
  const clippingLength = content?.length ?? 0

  for (const node of rootNode.childNodes) {
    if (endFound || charsHighlighted >= clippingLength) {
      console.log(charsHighlighted, clippingLength, endFound, highlightRange.startDOMEl)
      break
    }

    // Element nodes represent containers -> recurseive call on the visible nodes
    if (node.nodeType === Node.ELEMENT_NODE) {
      const { visibility, display } = window.getComputedStyle(node as Element)
      if (visibility !== 'hidden' && display !== 'none') {
        // Update the state with returned values from the recursive call
        // semicolon is added by prettier
        ;[startFound, endFound, charsHighlighted] = recursiveNodeProcess({
          rootNode: node,
          highlightRange,
          startFound,
          endFound,
          charsHighlighted,
        })
      }
      continue
    }

    if (node.nodeType === Node.TEXT_NODE) {
      // Process only after the start node is found
      if (node === startDOMEl || startFound) {
        startFound = true // Mark the start as found the first time we access the function

        // Determine the start and end index for highlighting in this text node
        const startIndex = node === startDOMEl ? startOffset : 0
        const isEndNode = node === endDOMEl
        const endIndex = isEndNode ? endOffset : node?.textContent?.length ?? 0

        // Highlight the text node and update the count of highlighted characters
        charsHighlighted += applyTextHighlight(node, startIndex, endIndex)

        // If this is the end node, mark the end as found and stop processing further
        if (isEndNode) {
          endFound = true
        }
      }
    }
  }

  return [startFound, endFound, charsHighlighted]
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

function applyTextHighlight(node: Node, startOffset: number, endOffset: number) {
  const textNode = node as Text
  const parentNode = node.parentNode as Element

  const nodeTextLength = textNode?.textContent?.length ?? 0

  // We skip the whitespace/newline nodes.
  // But still return their length as if they were highlighted
  if (!textNode?.textContent?.trim()) {
    return nodeTextLength
  }

  // If the entire text node is to be highlighted, we apply the class onto the parent
  if (startOffset === 0 && endOffset >= nodeTextLength) {
    parentNode?.classList?.add(HIGHLIGHT_CLASS)
    console.log(node, parentNode)
    return nodeTextLength
  }

  // SplitText splits the text node in 2, and returns the new node after the offset
  const textToHighlight = startOffset > 0 ? textNode.splitText(startOffset) : textNode

  // If selection is shorter than the text item, split it again
  if (endOffset < nodeTextLength) {
    textToHighlight.splitText(endOffset - startOffset)
  }

  const nrOfCharsToHighlight = textToHighlight.textContent?.length

  const span = document.createElement('span')
  // @TODO: test the Slit TextNode class a bit better...
  span.classList.add(HIGHLIGHT_CLASS, SPLIT_TEXTNODE_CLASS)
  span.textContent = textToHighlight.textContent

  parentNode?.replaceChild(span, textToHighlight)

  return nrOfCharsToHighlight
}

// Selector comes serialized from the DB
function parseSelector(selector: string | any) {
  return typeof selector === 'string' ? JSON.parse(selector) : selector
}
