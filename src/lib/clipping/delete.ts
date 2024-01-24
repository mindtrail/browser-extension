import { HIGHLIGHT_CLASS, SPLIT_TEXTNODE_CLASS } from '~/lib/constants'

export function getDeleteBtnCoordinates(elementList: Element[]) {
  try {
    // Find max Y value, and Min & Max X values

    let YCoord = 0
    let XCoord = 0

    for (const element of elementList) {
      const { left, bottom, width } = element.getBoundingClientRect()

      YCoord = Math.max(YCoord, bottom)
      XCoord = Math.max(XCoord, left + width / 2 - 16)
    }

    return {
      left: XCoord + window.scrollX,
      top: YCoord + window.scrollY + 24,
    }
  } catch (error) {
    console.error(error)
    return {
      left: 0,
      top: 0,
    }
  }
}

export function removeHighlightClass(elementList: Element[]) {
  for (const element of elementList) {
    element.classList.remove(HIGHLIGHT_CLASS, SPLIT_TEXTNODE_CLASS)
  }
}