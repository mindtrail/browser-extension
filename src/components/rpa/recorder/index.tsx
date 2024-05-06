import React, { useState, useEffect } from 'react'

import { Typography } from '~components/typography'

import { Events } from '../events'
import { CancelRecordingButton } from './cancel-recording-button'
import { listenEvents } from './listen-events'
import { RecordButton } from './record-button'
import { generateMetadata } from '../utils/openai'
import { createFlow } from '../utils/supabase'
import { getStartDependencies, getEndDependencies } from './get-dependencies'

export function FlowRecorder() {
  const [recording, setRecording] = useState(false)
  // const [eventsRecorded, setEventsRecorded] = useState([])
  const [eventsMap, setEventsMap] = useState(new Map())

  useEffect(() => listenEvents(recordEvent, recording), [recording])
  useEffect(() => {
    if (!recording) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && recording) {
        cancelRecording()
      }
    }

    window.addEventListener('keydown', handleEscape)
    listenEvents(recordEvent, recording)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [recording])

  function cancelRecording() {
    setRecording(false)
    setEventsMap(new Map())
  }

  function recordEvent(event) {
    const { selector, type } = event

    setEventsMap((prevMap) => {
      const prevEvents = prevMap.get(selector) || []
      const start_dependencies = getStartDependencies(prevEvents, event)
      const newEvents =
        type === 'input' ? [event] : [...prevEvents, { ...event, start_dependencies }]

      return new Map(prevMap).set(selector, newEvents)
    })
  }

  function removeEvent(event) {
    setEventsMap((prevMap) => {
      prevMap.delete(event?.selector)
      return new Map(prevMap)
    })
  }

  async function toggleRecording() {
    setRecording(!recording)
    setEventsMap(new Map())

    if (!recording || !eventsMap.size) {
      return
    }

    const eventsRecorded = Array.from(eventsMap.values()).flat()
    const flow = await generateMetadata(eventsRecorded)

    flow.events = eventsRecorded.map((event, index) => {
      const end_dependencies = getEndDependencies(eventsRecorded, event)
      return {
        ...event,
        end_dependencies,
        event_name: flow.events[index]?.event_name,
        event_description: flow.events[index]?.event_description,
      }
    })

    console.log(flow)
    createFlow(flow)
  }

  return (
    <div
      className={`${recording ? 'h-[calc(100%-52px)]' : 'h-auto'}
        flex flex-col justify-end gap-2 px-4 py-2
        w-full absolute bottom-0 border bg-slate-50`}
    >
      {recording && !eventsMap?.size && (
        <Typography className='w-full text-center mb-5'>Recording events...</Typography>
      )}
      {eventsMap?.size > 0 && (
        <div className='flex flex-col flex-1 justify-between pt-2 h-full overflow-auto'>
          <CancelRecordingButton onClick={cancelRecording} />
          <Events eventsMap={eventsMap} removeEvent={removeEvent} />
        </div>
      )}
      <RecordButton onClick={toggleRecording} recording={recording} />
    </div>
  )
}
