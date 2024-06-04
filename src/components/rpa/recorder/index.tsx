import { useEffect } from 'react'
import { LoaderCircleIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Typography } from '~components/typography'

import { EventsList } from '../events-list'
import { generateMetadata } from '~/lib/llm/openai'
import { sendMessageToBg } from '~lib/utils/bg-messaging'
import { MESSAGES, MESSAGE_AREAS } from '~/lib/constants'
import { useRecorderState } from '~lib/hooks/use-recorder-state'

import { CancelRecordingButton } from './cancel-recording-button'
import { listenEvents } from '~/lib/utils/recorder/listen-events'
import { RecordButton } from './record-button'

export function FlowRecorder() {
  const {
    isRecording,
    isPaused,
    isSaving,
    eventsList,
    resetRecorderState,
    setRecorderState,
  } = useRecorderState()

  useEffect(
    () => listenEvents(recordEvent, isRecording && !isPaused),
    [isRecording, isPaused],
  )

  useEffect(() => {
    if (!isRecording) return

    let currentOutlinedElement = null
    let isAltKeyPressed = false

    const handleMouseOver = (event: KeyboardEvent) => {
      removeOutlineStyles(currentOutlinedElement)
      currentOutlinedElement = event.target

      if (isAltKeyPressed) {
        addOutlineStyles(currentOutlinedElement)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
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

    window.addEventListener('mouseover', handleMouseOver)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('mouseover', handleMouseOver)
    }
  }, [isRecording, resetRecorderState])

  // @TODO: Add an absolute position overlay with a high Z-Index and BG
  function addOutlineStyles(element: HTMLElement) {
    if (!element) return

    element.style.outline = '2px dashed green'
    element.style.outlineOffset = '1px'
    element.style.borderRadius = '4px'
    element.style.cursor = 'pointer'
    element.style.backgroundColor = 'rgba(0, 255, 0, 0.07)'
  }

  function removeOutlineStyles(element: HTMLElement) {
    if (!element) return

    element.style.outline = ''
    element.style.outlineOffset = ''
    element.style.borderRadius = ''
    element.style.cursor = ''
    element.style.backgroundColor = ''
  }

  function generateKey(eventKey, lastKey, prevEvents = []) {
    let key = eventKey
    const lastEvent = prevEvents[prevEvents.length - 1]
    if (lastEvent && lastEvent.eventKey !== eventKey) {
      // create new key
      const i = prevEvents.filter((e) => e.eventKey.startsWith(eventKey)).length + 1
      key = `${eventKey}_${i}`
    } else if (lastEvent && lastEvent.eventKey === eventKey) {
      // reuse last key
      key = lastKey
    }
    return key
  }

  // let lastKey = ''
  function recordEvent(event) {
    setRecorderState((prevState) => {
      // @TODO: reimplement this
      // const prevEvents = prevState?.eventsList
      // lastKey = generateKey(event.eventKey, lastKey, prevEvents)
      // use array for each key instead of single event (potentially useful for repetitive events)

      console.log(event, prevState)
      const eventAlreadyInList = prevState?.eventsList.find(
        (e) => e.selector === event.selector,
      )
      const updatedEventsList = eventAlreadyInList
        ? prevState?.eventsList.map((e) => {
            if (e.selector === event.selector) {
              return {
                ...event,
                count: e.count + 1,
              }
            }
            return e
          })
        : [...prevState?.eventsList, event]

      return {
        ...prevState,
        eventsList: updatedEventsList,
      }
    })
  }

  function deleteEvent(index: number) {
    setRecorderState((prevState) => {
      const remainingEvents = prevState?.eventsList.filter((_e, i) => i !== index)
      return {
        ...prevState,
        eventsList: remainingEvents,
      }
    })
  }

  async function toggleRecording() {
    if (!isRecording) {
      setRecorderState((prevState) => ({
        ...prevState,
        isRecording: true,
      }))
      return
    }

    if (!eventsList.length) {
      resetRecorderState()
      return
    }

    setRecorderState((prevState) => ({
      ...prevState,
      isSaving: true,
    }))

    const eventsRecorded = Array.from(eventsList.values()).flat()
    const flow = await generateMetadata(eventsRecorded)

    flow.events = eventsRecorded.map((event: Event, index) => {
      return {
        ...event,
        event_name: flow.events[index]?.event_name,
        event_description: flow.events[index]?.event_description,
      }
    })

    setRecorderState((prevState) => ({
      ...prevState,
      isRecording: false,
      isSaving: false,
    }))

    sendMessageToBg({
      name: MESSAGE_AREAS.FLOWS,
      body: {
        type: MESSAGES.CREATE_FLOW,
        payload: flow,
      },
    })

    resetRecorderState()
  }

  function togglePause() {
    setRecorderState((prevState) => ({
      ...prevState,
      isPaused: !prevState.isPaused,
    }))
  }

  return (
    <div
      className={`${isRecording ? 'h-[calc(100%-52px)]' : 'h-auto'}
        flex flex-col justify-end gap-2 px-4 py-2
        w-full absolute bottom-0 border bg-slate-50`}
    >
      {isRecording && (
        <div className='flex flex-col flex-1 justify-between pt-2 h-full overflow-auto'>
          <CancelRecordingButton onClick={resetRecorderState} />
          <EventsList eventsList={eventsList} deleteEvent={deleteEvent} />
        </div>
      )}

      {isRecording && !eventsList?.length && (
        <Typography className='w-full text-center mb-6'>
          {isPaused ? 'isPaused Recording' : 'Recording Workflow...'}
        </Typography>
      )}

      {isSaving ? (
        <Button
          className='flex w-full gap-4 items-center !opacity-75'
          variant='outline'
          disabled
        >
          <LoaderCircleIcon className='w-5 h-5 animate-spin' />
          <Typography>Saving Workflow...</Typography>
        </Button>
      ) : (
        <RecordButton
          onToggleRecording={toggleRecording}
          onPause={togglePause}
          isRecording={isRecording}
          isPaused={isPaused}
        />
      )}
    </div>
  )
}
