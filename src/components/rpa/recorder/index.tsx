import React, { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import listenEvents from './listen-events'
import { RecordButton } from './record-button'
import { Actions } from '../actions'

export function FlowRecorder({ flows, setFlows }) {
    const [recording, setRecording] = useState(false)
    const [currentFlowId, setCurrentFlowId] = useState(null)

    useEffect(() => {
        const removeEventListeners = listenEvents(onEvent, recording)
        return () => removeEventListeners()
    }, [recording])

    function onEvent(event) {
        console.log(event)
        if (!recording || !currentFlowId) return
        setFlows((prevFlows) => {
            const updatedEvents = prevFlows[currentFlowId]
                ? [...prevFlows[currentFlowId], event]
                : [event]
            const updatedFlows = { ...prevFlows, [currentFlowId]: updatedEvents }
            localStorage.setItem('flows', JSON.stringify(updatedFlows))
            return updatedFlows
        })
    }

    function toggleRecording() {
        if (!recording) {
            const newFlowId = uuidv4()
            setCurrentFlowId(newFlowId)
            window.dispatchEvent(new CustomEvent('reset-last-event-time'))
        } else {
            setCurrentFlowId(null)
            window.dispatchEvent(new CustomEvent('reset-last-event-time'))
        }
        setRecording(!recording)
    }

    return (
        <div>
            <RecordButton onClick={toggleRecording} recording={recording} />
            <Actions events={flows[currentFlowId]} />
        </div>
    )
}
