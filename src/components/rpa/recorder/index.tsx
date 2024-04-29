import React, { useState, useEffect } from 'react'
import { listenEvents } from './listen-events'
import { RecordButton } from './record-button'
import { mergeInputEvents } from '../utils/merge-input-events'
import { discardClickInputEvents } from '../utils/discard-click-input-events'
import { Actions } from '../actions'
import { generateFlowName } from '../utils/groq'
import { createFlow } from '../utils/supabase'

export function FlowRecorder() {
  const [recording, setRecording] = useState(false)
  const [currentFlow, setCurrentFlow] = useState(null)

  useEffect(() => listenEvents(onEvent, recording), [recording])

  function onEvent(event) {
    console.log(event)
    if (!recording || !currentFlow) return
    setCurrentFlow((prevFlow) => {
      if (!prevFlow) return prevFlow
      return { ...prevFlow, events: [...prevFlow.events, event] }
    })
  }

  async function toggleRecording() {
    if (!recording) {
      setCurrentFlow({
        name: '',
        description: '',
        events: [],
      })
    } else {
      const metadata = await generateFlowName(JSON.stringify(currentFlow.events))
      await createFlow({
        name: metadata.name,
        description: metadata.description,
        events: currentFlow.events,
      })
      setCurrentFlow(null)
    }
    window.dispatchEvent(new CustomEvent('reset-last-event-time'))
    setRecording(!recording)
  }

  let events = currentFlow?.events || []
  events = mergeInputEvents(events)
  events = discardClickInputEvents(events)

  return (
    <div className='flex flex-col absolute bottom-0 w-full max-h-[75%] border bg-slate-50'>
      <Actions events={events} debugMode={false} />
      <RecordButton onClick={toggleRecording} recording={recording} />
    </div>
  )
}
