import { addOutlineStyles, removeOutlineStyles } from '~/lib/utils/recorder/dom-styles'

let hoveredEl = null

export function handleMouseOver(event: MouseEvent) {
  removeOutlineStyles(hoveredEl)
  hoveredEl = event.target

  if (event?.altKey) {
    addOutlineStyles(hoveredEl)
  }
}

export function handleEscapeKey(event: KeyboardEvent, callback: () => void) {
  if (event.key === 'Escape') {
    const target = event?.target as HTMLElement

    if (target.nodeName === 'INPUT' || target.nodeName === 'TEXTAREA') {
      return
    }
    callback()
  }
}

export function handleAltPress(event: KeyboardEvent) {
  if (event.key === 'Alt') {
    // Instant highlighting - mouseover will not trigger if already on the element
    hoveredEl?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, altKey: true }))
  }
}

export function handleAltRelease(event: KeyboardEvent) {
  if (event.key === 'Alt') {
    removeOutlineStyles(hoveredEl)
  }
}
