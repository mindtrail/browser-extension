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
  const [currentFlow, setCurrentFlow] = useState(null)

  useEffect(() => listenEvents(onEvent, recording), [recording])

  function onEvent(event) {
    console.log(event)
    if (!recording || !currentFlow) return
    setCurrentFlow((prevFlow) => {
      if (!prevFlow) return prevFlow
      let events = prevFlow.events || []
      events = [...events, event]
      events = mergeInputEvents(events)
      events = discardClickInputEvents(events)
      return { ...prevFlow, events }
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
    setRecording(!recording)
  }

  return (
    <div className='flex flex-col absolute bottom-0 w-full max-h-[75%] border bg-slate-50'>
      <div className='flex flex-col px-2 py-2'>
        <Actions events={currentFlow?.events} debugMode={false} />
      </div>
      <RecordButton onClick={toggleRecording} recording={recording} />
    </div>
  )
}
