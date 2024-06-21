import { useEffect } from 'react'

import { DOM_EVENT } from '~/lib/constants'
import { handleClickEvent } from '~lib/utils/recorder/event-handlers/click-event'
import { handleInputEvent } from '~lib/utils/recorder/event-handlers/input-event'
import {
  handleMouseOver,
  handleKeyDown,
  handleKeyUp,
} from '~lib/utils/recorder/event-handlers/ui-state/dom-events'

const { CLICK, INPUT, MOUSEOVER, KEYDOWN, KEYUP } = DOM_EVENT

type Event = {
  type: DOM_EVENT
  handler: (event: any) => any
}

function addEventListeners(eventList: Event[]) {
  eventList.forEach(({ type, handler }) => document.addEventListener(type, handler, true))
}

function removeEventListeners(eventList: Event[]) {
  eventList.forEach(({ type, handler }) =>
    document.removeEventListener(type, handler, true),
  )
}

interface EventListenersProps {
  isRecording: boolean
  isPaused: boolean
  updateRecordedEvents: Function
  resetRecorderState: () => void
}

export function useEventListeners(props: EventListenersProps) {
  const { isRecording, isPaused, updateRecordedEvents, resetRecorderState } = props

  useEffect(() => {
    if (!isRecording) return

    console.log(isRecording, isPaused)
    const uiStateEvents: Event[] = [
      { type: MOUSEOVER, handler: handleMouseOver },
      { type: KEYDOWN, handler: (e) => handleKeyDown(e, resetRecorderState) },
      { type: KEYUP, handler: handleKeyUp },
    ]
    addEventListeners(uiStateEvents)

    if (isPaused)
      return () => {
        removeEventListeners(uiStateEvents)
      }

    const recordingEvents: Event[] = [
      { type: CLICK, handler: (e) => handleClickEvent(e, updateRecordedEvents) },
      { type: INPUT, handler: (e) => handleInputEvent(e, updateRecordedEvents) },
    ]

    addEventListeners(recordingEvents)

    return () => {
      removeEventListeners(recordingEvents)
      removeEventListeners(uiStateEvents)
    }
  }, [isRecording, isPaused, updateRecordedEvents, resetRecorderState])
}
