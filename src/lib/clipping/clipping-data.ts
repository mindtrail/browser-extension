import { start } from 'repl'
import { getPageData } from '~/lib/page-data'
import { getSelectionContent } from '~/lib/utils'

const SURROUNDING_LENGTH = 40
const SURROUNDING_DIR = {
  BEFORE: 'before',
  AFTER: 'after',
}

const IDENTIFIER_NESTED_LEVELS = 5
const XPATH_LEVELS = 999

const payload_format = {
  content: 'clipping content',
  selector: {},
  notes: [],
  pageData: '{ ...pageData }', // Only send it the first time... until the page was saved...?
  type: 'text', // or 'file'
  url: 'url',
  externalResources: [],
}

export const getClippingData = (range: Range) => {
  const {
    startContainer,
    startOffset,
    endContainer,
    endOffset,
    commonAncestorContainer,
  } = range

  const response = {
    content: range.toString(),
    color: '',
    externalResources: [],
    pageNumber: null,
    selector: {
      range: {
        startContainer: getContainerIdentifier(startContainer),
        startOffset,
        endContainer: getContainerIdentifier(endContainer),
        endOffset,
        commonAncestorContainer: getContainerIdentifier(commonAncestorContainer),
      },
      textPosition: {
        start: 0,
        end: 0,
      },
      surrounding: {
        before: getTextBefore(startContainer, startOffset),
        // after: getSurroundingText(endContainer, endOffset, SURROUNDING_DIR.AFTER),
      },
    },
  }

  console.log(response.selector?.surrounding)

  return response
}

// From an DOM element, get a query to that DOM element
function getContainerIdentifier(
  node: ChildNode | Node,
  maxLevel = IDENTIFIER_NESTED_LEVELS,
  currentLevel = 0,
) {
  // If items are have IDs, use those, as they should be unique
  if ((node as Element)?.id) {
    return `#${escapeCSSString((node as Element).id)}`
  }

  if (node.nodeName === 'html' || currentLevel >= maxLevel) {
    return ''
  }
  const parent = node.parentNode
  const parentSelector = getContainerIdentifier(parent, maxLevel, currentLevel + 1)
  const nodeName = node.nodeType === Node.TEXT_NODE ? 'text' : node.nodeName.toLowerCase()

  const index = Array.from(parent.childNodes)
    .filter((child) => child.nodeType === node.nodeType)
    .indexOf(node as ChildNode)
  return `${parentSelector}/${nodeName}[${index}]`
}

// Colons and spaces are accepted in IDs in HTML but not in CSS syntax
// Similar (but much more simplified) to the CSS.escape() working draft
function escapeCSSString(cssString: string) {
  return cssString.replace(/(:)/gu, '\\$1')
}

function getTextBefore(
  node: Node,
  startOffset: number,
  contextLength: number = SURROUNDING_LENGTH,
) {
  const textContent = node.textContent || ''
  // Adjust start point based on the current node's text content length and startOffset
  const adjustedStart = Math.max(startOffset - contextLength, 0)
  const currentText = textContent.substring(adjustedStart, startOffset)

  const remainingLength = contextLength - currentText.length

  // If more text is needed and there's a parent node
  if (remainingLength > 0 && node.parentNode) {
    const textFromParent = getTextBefore(
      node.parentNode,
      node.parentNode.textContent.indexOf(textContent),
      remainingLength,
    )

    return textFromParent + currentText
  }

  return currentText
}

function getSurroundingText(
  node: Node,
  offset: number,
  direction: string = SURROUNDING_DIR.BEFORE,
  contextLength: number = SURROUNDING_LENGTH,
  currentContent = '',
  currentLength = 0,
) {
  const textContent = node.textContent
  let newContent = ''
  let newOffset = 0

  if (direction === SURROUNDING_DIR.BEFORE) {
    const start = Math.max(0, offset - contextLength)
    const end = offset
    newContent = textContent.substring(start, end) + currentContent
  } else {
    // 'after'
    const start = offset
    const end = Math.min(textContent.length, offset + contextLength)
    newContent = currentContent + textContent.substring(offset, offset + contextLength)
    newOffset = 0
  }

  // Update the length of the extracted content
  currentLength = newContent.length

  // Check if the desired length is met or if we can move up the DOM tree
  if (currentLength < contextLength && node.parentNode) {
    // Recursive call with the parent node
    return getSurroundingText(
      node.parentNode,
      newOffset,
      direction,
      contextLength,
      newContent,
      currentLength,
    )
  } else {
    // Return the final content when the desired length is met or no more parents
    return newContent
  }
}
