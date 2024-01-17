import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { minimatch } from 'minimatch'

import { EXCLUDED_TAGS_FOR_CLIPPING } from '~/lib/constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const addHttpsIfMissing = (url: string) => {
  if (!/^https?:\/\//i.test(url)) {
    return 'https://' + url
  }
  return url
}

export function isHostExcluded(excludeList: string[] = []) {
  const hostName = window.location.hostname

  return excludeList?.some((pattern) => minimatch(hostName, pattern))
}

export function getClippingBtnPosition(range: Range) {
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

export function getSelectionContent(range: Range) {
  const fragment = range.cloneContents()
  const text = fragment.textContent

  // Using a TreeWalker to retrieve images from the document fragment
  const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) =>
      node.nodeName.toLowerCase() === 'img'
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT,
  })

  const images = []
  while (walker.nextNode()) {
    images.push(walker.currentNode.src) // Assuming you want the image source
  }

  return { text, images }
}

function recursiveWrapper(container, highlightInfo) {
  return _recursiveWrapper(container, highlightInfo, false, 0)
}

function _recursiveWrapper(container, highlightInfo, startFound, charsHighlighted) {
  const {
    anchor,
    focus,
    anchorOffset,
    focusOffset,
    color,
    textColor,
    highlightIndex,
    selectionString,
  } = highlightInfo
  const selectionLength = selectionString.length

  // Get the child nodes of the container
  const childNodes = [...container.childNodes]

  childNodes.forEach((element) => {
    if (charsHighlighted >= selectionLength) return

    // Skip non-text nodes and invisible nodes
    if (element.nodeType !== Node.TEXT_NODE) {
      if (element.nodeType === Node.ELEMENT_NODE && element.offsetParent !== null) {
        let computedStyle = window.getComputedStyle(element)
        if (computedStyle.visibility !== 'hidden') {
          let result = _recursiveWrapper(
            element,
            highlightInfo,
            startFound,
            charsHighlighted,
          )
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

// Convert jQuery objects to regular DOM nodes for the anchor and focus
// highlightInfo.anchor = selection.anchorNode;
// highlightInfo.focus = selection.focusNode;

// Call the recursiveWrapper function with a DOM node instead of a jQuery object
// recursiveWrapper(container, highlightInfo);

function escapeCSSString(cssString) {
  return cssString.replace(/(:)/gu, '\\$1')
}


function getIdentifier(element) {
  if (element?.id) return `#${escapeCSSString(element.id)}`
  if (element.nodeName === 'html') return 'html'

  const parent = element.parentNode

  const parentSelector = getIdentifier(parent)
  // The element is a text node
  if (!element.nodeName) {
    // Find the index of the text node:
    const index = Array.prototype.indexOf.call(parent.childNodes, element)
    return `${parentSelector}>textNode:nth-of-type(${index})`
  } else {
    const index =
      Array.from(parent.childNodes)
        .filter((child) => child.nodeName === element.nodeName)
        .indexOf(element ) + 1
    return `${parentSelector}>${element.nodeName}:nth-of-type(${index})`
  }
}
