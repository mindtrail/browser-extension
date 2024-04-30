import React, { useState, useEffect } from 'react'
import { listenEvents } from './listen-events'
import { RecordButton } from './record-button'
import { mergeInputEvents } from '../utils/merge-input-events'
import { discardClickInputEvents } from '../utils/discard-click-input-events'
import { Actions } from '../actions'
import { generateFlowName } from '../utils/openai'
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
    // Async setters. Will update only in the next render, so we can call them here.
    setRecording(!recording)
    setEventsRecorded([])

    if (!recording || !eventsRecorded.length) {
      return
    }

    const metadata = await generateFlowName(JSON.stringify(eventsRecorded))
    createFlow({
      name: metadata?.name,
      description: metadata?.description,
      events: eventsRecorded,
    })
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
