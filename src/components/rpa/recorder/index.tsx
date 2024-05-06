import React, { useState, useEffect } from 'react'

import { generateMetadata } from '../utils/groq'
import { createFlow } from '../utils/supabase'
import { Events } from '../events'

import { listenEvents } from './listen-events'
import { RecordButton } from './record-button'
import { CancelRecordingButton } from './cancel-recording-button'

import { Typography } from '~components/typography'

export function FlowRecorder() {
  const [recording, setRecording] = useState(false)
  const [eventsRecorded, setEventsRecorded] = useState([])
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
    setEventsRecorded([])
  }

  function recordEvent(event) {
    const { selector, type } = event

    setEventsMap((prevMap) => {
      const prevEvents = prevMap.get(selector) || []
      const newEvents = type === 'input' ? [event] : [...prevEvents, event]

      return new Map(prevMap).set(selector, newEvents)
    })
  }

  function removeEvent(event) {
    setEventsRecorded((prevEvents) =>
      prevEvents.filter((e) => e?.timeStamp !== event?.timeStamp),
    )
  }

  async function toggleRecording() {
    setRecording(!recording)
    setEventsRecorded([])

    if (!recording || !eventsRecorded.length) {
      return
    }

    const flow = await generateMetadata(eventsRecorded)
    flow.events = eventsRecorded.map((event, index) => ({
      ...event,
      event_name: flow.events[index]?.event_name,
      event_description: flow.events[index]?.event_description,
    }))
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
