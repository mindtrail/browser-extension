import React, { useState, useEffect } from 'react'

import { mergeInputEvents } from '../utils/merge-input-events'
import { discardClickInputEvents } from '../utils/discard-click-input-events'
import { generateFlowName } from '../utils/openai'
import { createFlow } from '../utils/supabase'
import { Events } from '../events'

import { listenEvents } from './listen-events'
import { RecordButton } from './record-button'
import { CancelRecordingButton } from './cancel-recording-button'
import { Typography } from '~components/typography'

export function FlowRecorder() {
  const [recording, setRecording] = useState(false)
  const [eventsRecorded, setEventsRecorded] = useState([])

  useEffect(() => listenEvents(recordEvent, recording), [recording])
  useEffect(() => {
    if (!recording) return
    console.log(222)

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
    setEventsRecorded((prevEvents) =>
      discardClickInputEvents(mergeInputEvents([...prevEvents, event])),
    )
  }

  function removeEvent(event) {
    setEventsRecorded((prevEvents) =>
      prevEvents.filter((e) => e?.timeStamp !== event?.timeStamp),
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
  console.log(11, eventsRecorded)

  return (
    <div
      className={`${recording ? 'h-[calc(100%-52px)]' : 'h-auto'}
        flex flex-col justify-end gap-2 px-4 py-2
        w-full absolute bottom-0 border bg-slate-50`}
    >
      {recording && !eventsRecorded?.length && (
        <Typography className='w-full text-center mb-5'>Recording events...</Typography>
      )}
      {eventsRecorded?.length > 0 && (
        <div className='flex flex-col flex-1 justify-between pt-2 h-full overflow-auto'>
          <CancelRecordingButton onClick={cancelRecording} />
          <Events events={eventsRecorded} removeEvent={removeEvent} />
        </div>
      )}
      <RecordButton onClick={toggleRecording} recording={recording} />
    </div>
  )
}
