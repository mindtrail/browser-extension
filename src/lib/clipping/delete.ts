import {
  CLIPPING_BTN_OFFSET,
  HIGHLIGHT_CLASS,
  SPLIT_TEXTNODE_CLASS,
} from '~/lib/constants'

export function getDeleteBtnCoordinates(elementList: Element[]) {
  try {
    let YCoord = 0
    let XCoordMin = 2000
    let XCoordMax = 0

    for (const element of elementList) {
      const { left, bottom, right } = element.getBoundingClientRect()

      YCoord = Math.max(YCoord, bottom)
      XCoordMin = Math.min(XCoordMin, left)
      XCoordMax = Math.max(XCoordMax, right)
    }

    const XCoord = (XCoordMax + XCoordMin) / 2 - CLIPPING_BTN_OFFSET
    return {
      left: XCoord + window.scrollX,
      top: YCoord + window.scrollY + 24,
    }
  } catch (error) {
    console.error('Error getting Delete Btn Coordinates', error)
    return null
  }
}

export function removeHighlightClassAndAttr(elementList: Element[]) {
  for (const element of elementList) {
    element.classList.remove(HIGHLIGHT_CLASS, SPLIT_TEXTNODE_CLASS)
    element.removeAttribute('data-highlight-id')
  }
}
