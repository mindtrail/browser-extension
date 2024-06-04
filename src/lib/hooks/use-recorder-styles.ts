import { useEffect } from 'react'
import { addOutlineStyles, removeOutlineStyles } from '~/lib/utils/recorder/dom-styles'

interface UseRecorderEventsProps {
  isRecording: boolean
  resetRecorderState: () => void
}
export function useRecorderStyles(props: UseRecorderEventsProps) {
  const { isRecording, resetRecorderState } = props

  let currentOutlinedElement: HTMLElement | null = null
  let isAltKeyPressed = false

  const handleMouseOver = (event: KeyboardEvent) => {
    removeOutlineStyles(currentOutlinedElement)
    currentOutlinedElement = event.target as HTMLElement

    if (isAltKeyPressed) {
      addOutlineStyles(currentOutlinedElement)
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
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

  return { handleMouseOver, handleKeyDown, handleKeyUp }
}
