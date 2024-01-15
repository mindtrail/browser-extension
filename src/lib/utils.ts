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

export function getXPath(element: Element) {
  let xpath = ''
  // Loop through the ancestors of the element until we reach the root
  while (element && element.nodeType === 1 && element.tagName.toLowerCase() !== 'body') {
    const siblings = Array.from(element.parentNode.children)

    // Find the index of the current element among its siblings, and add 1 to get a 1-based index
    let position = `[${siblings.indexOf(element)}]`
    xpath = '/' + element.tagName.toLowerCase() + position + xpath

    element = element.parentNode as Element
  }
  return xpath
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
export function isExcludedElement(range: Range) {
  let element = range.commonAncestorContainer as HTMLElement

  while (element?.nodeType !== Node.ELEMENT_NODE) {
    element = element.parentNode as HTMLElement
  }

  if (element.contentEditable === 'true') {
    return true
  }

  return EXCLUDED_TAGS_FOR_CLIPPING.includes(element?.tagName)
}
