import { getPageData } from '~/lib/page-data'
import { EXCLUDED_TAGS_FOR_CLIPPING } from '~/lib/constants'

const SURROUNDING_LENGTH = 40
const XPATH_LEVELS = 999

export const getClippingData = (range: Range): SavedClipping => {
  const {
    startContainer,
    startOffset,
    endContainer,
    endOffset,
    commonAncestorContainer,
  } = range

  const { text: content } = getSelectionContent(range)
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

// Get an identifier for a DOM element, be it an ID or a 'filtered' XPath starting from the BODY
function getContainerIdentifier(node: ChildNode | Node, currentLevel = 0) {
  const parent = node.parentNode

  if (!node || !parent || node.nodeName === 'BODY') {
    return ''
  }

  // If items are have IDs, use those, as they should be unique, except when we want full XPATH
  if ((node as Element)?.id) {
    return `#${escapeCSSString((node as Element).id)}`
  }

  const parentSelector = getContainerIdentifier(parent, currentLevel + 1)
  // nodeName of text is '#text'. It may conflict with an id that is #text or starts with #text
  const nodeName = node.nodeType === Node.TEXT_NODE ? 'TEXT_NODE' : node.nodeName

  const index = [...parent.childNodes]
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

function getSelectionContent(range: Range) {
  const fragment = range.cloneContents()
  const text = fragment.textContent

  const images = []
  fragment
    .querySelectorAll('img')
    .forEach((img) => images.push({ src: img.src, alt: img.alt }))

  return { text, images }
}

export function getSaveClippingBtnPosition(range: Range) {
  const { bottom, left, width } = range.getBoundingClientRect()
  const XCoord = left + width / 2 - 16 // half of button width

  return {
    left: XCoord + window.scrollX,
    top: bottom + window.scrollY + 24,
  }
}

// @TODO - proper check if it's not in a form element, or like in Mindtrail, it detect the div...
export function isSelectionExcludedNode(range: Range) {
  if (!range) {
    return false
  }

  const { startContainer, endContainer, commonAncestorContainer } = range

  const nodeIsContentEditable =
    isNodeContentEditable(startContainer) ||
    isNodeContentEditable(endContainer) ||
    isNodeContentEditable(commonAncestorContainer)

  const nodeIsExcluded =
    isNodeInTheExcludedList(startContainer) ||
    isNodeInTheExcludedList(endContainer) ||
    isNodeInTheExcludedList(commonAncestorContainer)

  return nodeIsContentEditable || nodeIsExcluded
}

function isNodeContentEditable(node: Node) {
  if (!node) {
    return false
  }

  const element = (
    node.nodeType === Node.TEXT_NODE ? node.parentNode : node
  ) as HTMLElement

  return element.isContentEditable || element.contentEditable === 'true'
}

function isNodeInTheExcludedList(node: Node) {
  const element = (
    node.nodeType === Node.TEXT_NODE ? node.parentNode : node
  ) as HTMLElement

  return EXCLUDED_TAGS_FOR_CLIPPING.includes(element?.tagName)
}
