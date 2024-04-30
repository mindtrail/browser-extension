import React, { useState, useEffect } from 'react'

import { mergeInputEvents } from '../utils/merge-input-events'
import { discardClickInputEvents } from '../utils/discard-click-input-events'
import { generateFlowName } from '../utils/openai'
import { createFlow } from '../utils/supabase'
import { Events } from '../events'

import { listenEvents } from './listen-events'
import { RecordButton } from './record-button'

export function FlowRecorder() {
  const [recording, setRecording] = useState(false)
  const [eventsRecorded, setEventsRecorded] = useState([])

  useEffect(() => listenEvents(recordEvent, recording), [recording])
  useEffect(() => {
    if (!recording) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && recording) {
        setRecording(false)
        setEventsRecorded([])
      }
    }

    window.addEventListener('keydown', handleEscape)
    listenEvents(recordEvent, recording)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [recording])

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
    <div className='flex flex-col absolute bottom-0 w-full max-h-[75%] border bg-slate-50 px-4 py-2'>
      <Events events={eventsRecorded} />
      <RecordButton onClick={toggleRecording} recording={recording} />
    </div>
  )
}
