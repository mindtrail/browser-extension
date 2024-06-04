import { addOutlineStyles, removeOutlineStyles } from './dom-styles'

let currentOutlinedElement = null
let isAltKeyPressed = false

export const handleMouseOver = (event: KeyboardEvent) => {
  removeOutlineStyles(currentOutlinedElement)
  currentOutlinedElement = event.target

  if (isAltKeyPressed) {
    addOutlineStyles(currentOutlinedElement)
  }
}

export const handleKeyDown = (event: KeyboardEvent, resetRecorderState: () => void) => {
  if (event.key === 'Escape') {
    const target = event?.target as HTMLElement
    if (target.nodeName === 'INPUT' || target.nodeName === 'TEXTAREA') {
      return
    }

    resetRecorderState()
  }

  if (event.key === 'Alt') {
    isAltKeyPressed = true

    if (currentOutlinedElement) {
      currentOutlinedElement?.dispatchEvent(
        new MouseEvent('mouseover', { bubbles: true }),
      )
    }
  }
}

export const handleKeyUp = (event: KeyboardEvent) => {
  if (event.key === 'Alt') {
    isAltKeyPressed = false
    removeOutlineStyles(currentOutlinedElement)
  }
}
