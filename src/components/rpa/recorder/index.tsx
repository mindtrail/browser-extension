import React, { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { listenEvents } from './listen-events'
import { RecordButton } from './record-button'
import { mergeInputEvents } from '../utils/merge-input-events'
import { discardClickInputEvents } from '../utils/discard-click-input-events'
import { Actions } from '../actions'
import { generateFlowName } from '~/lib/llm'

export function FlowRecorder({ flows, setFlows }) {
  const [recording, setRecording] = useState(false)
  const [currentFlowId, setCurrentFlowId] = useState(null)
  const [recordedEvents, setRecordedEvents] = useState([])

  useEffect(() => {
    const removeEventListeners = listenEvents(onEvent, recording)
    return () => removeEventListeners()
  }, [recording])

  function onEvent(event) {
    if (!recording || !currentFlowId) return

    setRecordedEvents((events) => [...events, event])
  }

  async function toggleRecording() {
    window.dispatchEvent(new CustomEvent('reset-last-event-time'))

    if (!recording) {
      const newFlowId = uuidv4()
      setCurrentFlowId(newFlowId)
      setRecording(true)

      return
    }

    setRecordedEvents([])
    setRecording(false)

    // @TODO: handle the edit flow too
    if (recordedEvents?.length) {
      const flowToUpdate = {
        ...flows[currentFlowId],
        name: 'Creating flow...',
        description: 'in-progress',
        events: recordedEvents,
      }

      setFlows((prevFlows) => {
        const updatedFlows = { ...prevFlows, [currentFlowId]: flowToUpdate }
        localStorage.setItem('flows', JSON.stringify(updatedFlows))
        return updatedFlows
      })
      const metadata = await generateFlowName(JSON.stringify(recordedEvents))
      flowToUpdate.name = metadata.name
      flowToUpdate.description = metadata.description

      setFlows((prevFlows) => {
        const updatedFlows = { ...prevFlows, [currentFlowId]: flowToUpdate }
        localStorage.setItem('flows', JSON.stringify(updatedFlows))
        return updatedFlows
      })
    }

    setCurrentFlowId(null)
  }

  let events = mergeInputEvents(recordedEvents)
  events = discardClickInputEvents(recordedEvents)

  return (
    <div>
      <RecordButton onClick={toggleRecording} recording={recording} />
      <Actions events={events} debugMode={false} />
    </div>
  )
}
