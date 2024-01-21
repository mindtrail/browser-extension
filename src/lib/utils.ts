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

export function log(...args: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args)
  }
}
