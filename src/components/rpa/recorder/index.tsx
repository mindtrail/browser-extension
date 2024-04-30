import React, { useState, useEffect } from 'react'
import { listenEvents } from './listen-events'
import { RecordButton } from './record-button'
import { mergeInputEvents } from '../utils/merge-input-events'
import { discardClickInputEvents } from '../utils/discard-click-input-events'
import { Actions } from '../actions'
import { generateMetadata } from '../utils/groq'
import { createFlow } from '../utils/supabase'

export function FlowRecorder() {
  const [recording, setRecording] = useState(false)
  const [eventsRecorded, setEventsRecorded] = useState([])

  useEffect(() => listenEvents(recordEvent, recording), [recording])

  function recordEvent(event) {
    setEventsRecorded((prevEvents) =>
      discardClickInputEvents(mergeInputEvents([...prevEvents, event])),
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
    <div className='flex flex-col absolute bottom-0 w-full max-h-[75%] border bg-slate-50'>
      <div className={`${eventsRecorded?.length ? 'flex' : 'hidden'} flex-col px-2 py-2`}>
        <Actions events={eventsRecorded} debugMode={false} />
      </div>
      <RecordButton onClick={toggleRecording} recording={recording} />
    </div>
  )
}
