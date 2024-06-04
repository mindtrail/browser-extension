import { DOM_EVENT } from '~/lib/constants'
import { addEventListeners, removeEventListeners } from './add-remove-listeners'
import { addOutlineStyles, removeOutlineStyles } from './dom-styles'

const { MOUSEOVER, KEYDOWN, KEYUP } = DOM_EVENT

let currentOutlinedElement = null
let isAltKeyPressed = false

const handleMouseOver = (event: KeyboardEvent) => {
  removeOutlineStyles(currentOutlinedElement)
  currentOutlinedElement = event.target

  if (isAltKeyPressed) {
    addOutlineStyles(currentOutlinedElement)
  }
}

const handleKeyDown = (event: KeyboardEvent, resetRecorderState: () => void) => {
  console.log(222, event)

  // @TODO: Check if the event is not coming from the input field
  if (event.key === 'Escape') {
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

const handleKeyUp = (event: KeyboardEvent) => {
  if (event.key === 'Alt') {
    isAltKeyPressed = false
    removeOutlineStyles(currentOutlinedElement)
  }
}

export function listenHighlightEvents(shouldListen, resetRecorderState) {
  const highlightEvents = [
    { type: MOUSEOVER, handler: handleMouseOver },
    { type: KEYDOWN, handler: (e) => handleKeyDown(e, resetRecorderState) },
    { type: KEYUP, handler: handleKeyUp },
  ]

  console.log(111, shouldListen)

  if (shouldListen) {
    addEventListeners(highlightEvents)
  } else {
    removeEventListeners(highlightEvents)
  }

  return () => removeEventListeners(highlightEvents)
}
