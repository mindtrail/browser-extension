import { addOutlineStyles, removeOutlineStyles } from './dom-styles'

let hoveredEl = null

export const handleMouseOver = (event: MouseEvent) => {
  removeOutlineStyles(hoveredEl)
  hoveredEl = event.target

  if (event?.altKey) {
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
    // Instant highlighting - mouseover will not trigger if already on the element
    hoveredEl?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, altKey: true }))
  }
}

export const handleKeyUp = (event: KeyboardEvent) => {
  if (event.key === 'Alt') {
    removeOutlineStyles(hoveredEl)
  }
}
