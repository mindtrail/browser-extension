import { useEffect } from 'react'
import { LoaderCircleIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Typography } from '~components/typography'

import { EventsList } from '../events-list'
import { generateMetadata } from '~/lib/llm/openai'
import { sendMessageToBg } from '~lib/utils/bg-messaging'
import { MESSAGES } from '~/lib/constants'
import { useRecorderState } from '~/lib/hooks/useRecorder'

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

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isRecording) {
        resetRecorderState()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isRecording])

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
      console.log(prevState)
      const prevEvents = prevState?.eventsList

      // @TODO: reimplement this
      // lastKey = generateKey(event.eventKey, lastKey, prevEvents)
      // use array for each key instead of single event (potentially useful for repetitive events)

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
      name: 'flows',
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
          <Typography>isSaving Workflow...</Typography>
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
