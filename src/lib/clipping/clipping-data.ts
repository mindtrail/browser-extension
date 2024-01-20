import { start } from 'repl'
import { getPageData } from '~/lib/page-data'
import { getSelectionContent } from '~/lib/utils'

const SURROUNDING_LENGTH = 40

const IDENTIFIER_NESTED_LEVELS = 5
const XPATH_LEVELS = 999

export const getClippingData = (range: Range): SaveClipping => {
  const {
    startContainer,
    startOffset,
    endContainer,
    endOffset,
    commonAncestorContainer,
  } = range

  const content = range.toString()
  const pageData = getPageData()

  const selectorRange: ClippingRange = {
    startContainer: getContainerIdentifier(startContainer),
    startOffset,
    endContainer: getContainerIdentifier(endContainer),
    endOffset,
    commonAncestorContainer: getContainerIdentifier(
      commonAncestorContainer,
      XPATH_LEVELS,
    ),
  }

  const surroundingText: SurroundingText = {
    before: getTextBefore(startContainer, startOffset),
    after: getTextAfter(endContainer, endOffset),
  }

  const textPosition = getTextPosition(content, surroundingText)

  return {
    content,
    pageData,
    selector: {
      range: selectorRange,
      surroundingText,
      textPosition,
    },
  }
}

// From an DOM element, get a query to that DOM element
function getContainerIdentifier(
  node: ChildNode | Node,
  maxLevel = IDENTIFIER_NESTED_LEVELS,
  currentLevel = 0,
) {
  const parent = node.parentNode

  if (!node || node.nodeName === 'BODY' || !parent || currentLevel >= maxLevel) {
    return ''
  }

  // If items are have IDs, use those, as they should be unique, except when we want full XPATH
  if ((node as Element)?.id && maxLevel !== XPATH_LEVELS) {
    return `#${escapeCSSString((node as Element).id)}`
  }

  const parentSelector = getContainerIdentifier(parent, maxLevel, currentLevel + 1)
  const nodeName = node.nodeType === Node.TEXT_NODE ? 'text' : node.nodeName.toLowerCase()

  const index = Array.from(parent.childNodes)
    // Reduce the risk of dom changes by only relying on nodes of the same type
    .filter((child) => child.nodeName === node.nodeName)
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
  desiredLenght: number = SURROUNDING_LENGTH,
) {
  if (!node || desiredLenght <= 0) {
    return ''
  }

  const textContent = node.textContent || ''
  const currentText = textContent.substring(startOffset - desiredLenght, startOffset)
  const remainingLength = desiredLenght - currentText.length
  const parent = node.parentNode

  if (remainingLength <= 0 || !parent) {
    return currentText
  }

  const parentOffset = parent?.textContent?.indexOf(textContent)
  const textFromParent = getTextBefore(parent, parentOffset, remainingLength)

  return textFromParent + currentText
}

function getTextAfter(
  node: Node,
  endOffset: number,
  desiredLenght: number = SURROUNDING_LENGTH,
): string {
  if (!node || desiredLenght <= 0) {
    return ''
  }

  const textContent = node.textContent || ''
  const currentText = textContent.substring(endOffset, endOffset + desiredLenght)
  const remainingLength = desiredLenght - currentText.length
  let parent = node.parentNode

  if (remainingLength <= 0 || !parent) {
    return currentText
  }

  // If there are next siblings, get text from them
  if (node.nextSibling && node.nextSibling?.textContent?.length) {
    const textFromSibling = getTextAfter(node.nextSibling, 0, remainingLength)
    return currentText + textFromSibling
  }

  // If no next siblings, move up to the parent node and continue
  let child = node
  let textFromParent = ''

  while (!child?.nextSibling?.textContent && parent) {
    child = parent
    parent = parent.parentNode

    if (child.nextSibling) {
      textFromParent = getTextAfter(child.nextSibling, 0, remainingLength)
      break
    }
  }

  return currentText + textFromParent
}

// We compute the position in respect to the text content of the BODY
function getTextPosition(text: string, surroundingText: SurroundingText): TextPosition {
  const bodyTextContent = document.body.textContent || ''
  const { before, after } = surroundingText

  const highlightedText = before + text + after

  // We add the before/after to avoid the case where the text is repeated in the page
  const start = bodyTextContent.indexOf(highlightedText) + before.length
  const end = start + text.length

  return { start, end }
}
