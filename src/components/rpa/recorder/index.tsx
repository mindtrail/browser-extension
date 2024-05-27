import React, { useState, useEffect } from 'react'
import { LoaderCircleIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Typography } from '~components/typography'

import { Events } from '../events'
import { generateMetadata } from '../utils/openai'
import { sendMessageToBg } from '~/lib/bg-messaging'
import { useRecorderState } from '~/lib/hooks/useRecorder'
import { MESSAGES } from '~/lib/constants'

import { CancelRecordingButton } from './cancel-recording-button'
import { listenEvents } from './listen-events'
import { RecordButton } from './record-button'
import { getStartDependencies, getEndDependencies } from './get-dependencies'

export function FlowRecorder() {
  const { isRecording, eventsMap, paused, saving, setRecordingState } = useRecorderState()

  useEffect(
    () => listenEvents(recordEvent, isRecording && !paused),
    [isRecording, paused],
  )

  useEffect(() => {
    if (!isRecording) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isRecording) {
        resetRecordingState()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isRecording])

  function resetRecordingState() {
    setRecordingState({
      isRecording: false,
      eventsMap: new Map(),
      paused: false,
      saving: false,
    })
  }

  function recordEvent(event) {
    const { selector } = event

    setRecordingState((prevState) => {
      const prevMap = prevState?.eventsMap || new Map()
      const prevEvents = (prevMap.get(selector) as Event[]) || []
      const newEvents = [...prevEvents, event]

      return {
        ...prevState,
        eventsMap: new Map(prevMap).set(selector, newEvents),
      }
    })
  }

  function removeEvent(event) {
    setRecordingState((prevState) => {
      const prevMap = prevState?.eventsMap || new Map()
      prevMap.delete(event?.selector)
      return {
        ...prevState,
        eventsMap: new Map(prevMap),
      }
    })
  }

  async function toggleRecording() {
    const isRecordingState = !isRecording

    if (!isRecordingState || !eventsMap.size) {
      resetRecordingState()
      return
    }

    setRecordingState((prevState) => ({
      ...prevState,
      saving: true,
    }))

    const eventsRecorded = Array.from(eventsMap.values()).flat()
    const flow = await generateMetadata(eventsRecorded)

    flow.events = eventsRecorded.map((event: Event, index) => {
      const start_dependencies = getStartDependencies(eventsRecorded, event)
      const end_dependencies = getEndDependencies(eventsRecorded, event)
      return {
        ...event,
        start_dependencies,
        end_dependencies,
        event_name: flow.events[index]?.event_name,
        event_description: flow.events[index]?.event_description,
      }
    })

    resetRecordingState()
    sendMessageToBg({
      name: 'flows',
      body: {
        type: MESSAGES.CREATE_FLOW,
        payload: flow,
      },
    })
  }

  function togglePause() {
    setRecordingState((prevState) => ({
      ...prevState,
      paused: !prevState.paused,
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
          <CancelRecordingButton onClick={resetRecordingState} />
          <Events eventsMap={eventsMap as Map<string, any>} removeEvent={removeEvent} />
        </div>
      )}

      {isRecording && !eventsMap?.size && (
        <Typography className='w-full text-center mb-6'>
          {paused ? 'Paused Recording' : 'Recording Workflow...'}
        </Typography>
      )}

      {saving ? (
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
          paused={paused}
        />
      )}
    </div>
  )
}
