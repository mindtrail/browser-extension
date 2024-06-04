import { addOutlineStyles, removeOutlineStyles } from './dom-styles'

let hoveredEl = null
let isAltKeyPressed = false

export const handleMouseOver = (event: MouseEvent) => {
  removeOutlineStyles(hoveredEl)
  hoveredEl = event.target

  if (isAltKeyPressed) {
    addOutlineStyles(hoveredEl)
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

    // Instant highlighting - mouseover will not trigger if already on the element
    if (hoveredEl) {
      hoveredEl?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    }
  }
}

export const handleKeyUp = (event: KeyboardEvent) => {
  if (event.key === 'Alt') {
    removeOutlineStyles(hoveredEl)
    isAltKeyPressed = false
    hoveredEl = null
  }
}
