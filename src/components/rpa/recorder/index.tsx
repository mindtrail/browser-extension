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

  useEffect(() => {
    const removeEventListeners = listenEvents(onEvent, recording)
    return () => removeEventListeners()
  }, [recording])

  function onEvent(event) {
    if (!recording || !currentFlowId) return

    setFlows((prevFlows) => {
      console.log(111, prevFlows, currentFlowId)
      const updatedEvents = prevFlows[currentFlowId]?.events?.length
        ? [...prevFlows[currentFlowId].events, event]
        : [event]

      const updatedFlow = { ...prevFlows[currentFlowId], events: updatedEvents }
      const updatedFlows = { ...prevFlows, [currentFlowId]: updatedFlow }

      localStorage.setItem('flows', JSON.stringify(updatedFlows))
      return updatedFlows
    })
  }

  async function toggleRecording() {
    if (!recording) {
      const newFlowId = uuidv4()
      setCurrentFlowId(newFlowId)
      window.dispatchEvent(new CustomEvent('reset-last-event-time'))
      setRecording(true)
      return
    }

    setCurrentFlowId(null)
    window.dispatchEvent(new CustomEvent('reset-last-event-time'))
    setRecording(false)

    if (flows[currentFlowId]?.events?.length) {
      const metadata = await generateFlowName(JSON.stringify(flows[currentFlowId].events))

      setFlows((prevFlows) => {
        const updatedFlow = {
          ...prevFlows[currentFlowId],
          name: metadata.name,
          description: metadata.description,
        }
        const updatedFlows = { ...prevFlows, [currentFlowId]: updatedFlow }
        localStorage.setItem('flows', JSON.stringify(updatedFlows))
        return updatedFlows
      })
    }
  }

  let events = flows[currentFlowId]?.events || []
  events = mergeInputEvents(events)
  events = discardClickInputEvents(events)

  return (
    <div>
      <RecordButton onClick={toggleRecording} recording={recording} />
      <Actions events={events} debugMode={false} />
    </div>
  )
}
