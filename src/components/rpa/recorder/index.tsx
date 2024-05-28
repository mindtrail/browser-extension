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

export function FlowRecorder() {
  const {
    isRecording,
    setIsRecording,
    eventsMap,
    setEventsMap,
    paused,
    setPaused,
    saving,
    setSaving,
  } = useRecorderState()

  useEffect(
    () => listenEvents(recordEvent, isRecording && !paused),
    [isRecording, paused],
  )

  useEffect(() => {
    if (!isRecording) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isRecording) {
        cancelRecording()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isRecording])

  async function cancelRecording() {
    setIsRecording(false)
    setEventsMap(new Map())
    setPaused(false)
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

  let lastKey = ''
  function recordEvent(event) {
    setEventsMap((prevMap) => {
      const prevEvents = Array.from(prevMap.values()).flat()
      lastKey = generateKey(event.eventKey, lastKey, prevEvents)

      // use array for each key instead of single event (potentially useful for repetitive events)
      const prevEventsForKey = (prevMap?.get(lastKey) as []) || []
      const newEvents = [...prevEventsForKey, event]

      return new Map(prevMap).set(lastKey, newEvents)
    })
  }

  function removeEvent(index) {
    setEventsMap((prevMap) => {
      const newMap = new Map(prevMap)
      Array.from(prevMap.keys()).forEach((key, i) => {
        if (i === index) newMap.delete(key)
      })
      return newMap
    })
  }

  async function toggleRecording() {
    setIsRecording(!isRecording)
    setEventsMap(new Map())

    if (!isRecording || !eventsMap.size) {
      return
    }

    setSaving(true)
    const eventsRecorded = Array.from(eventsMap.values()).flat()
    const flow = await generateMetadata(eventsRecorded)

    flow.events = eventsRecorded.map((event: Event, index) => {
      return {
        ...event,
        event_name: flow.events[index]?.event_name,
        event_description: flow.events[index]?.event_description,
      }
    })

    setSaving(false)
    sendMessageToBg({
      name: 'flows',
      body: {
        type: MESSAGES.CREATE_FLOW,
        payload: flow,
      },
    })
  }

  return (
    <div
      className={`${isRecording ? 'h-[calc(100%-52px)]' : 'h-auto'}
        flex flex-col justify-end gap-2 px-4 py-2
        w-full absolute bottom-0 border bg-slate-50`}
    >
      {isRecording && (
        <div className='flex flex-col flex-1 justify-between pt-2 h-full overflow-auto'>
          <CancelRecordingButton onClick={cancelRecording} />
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
          onPause={() => setPaused(!paused)}
          isRecording={isRecording}
          paused={paused}
        />
      )}
    </div>
  )
}
