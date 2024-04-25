import React, { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import listenEvents from './listen-events'
import { RecordButton } from './record-button'

export function FlowRecorder() {
    const [recording, setRecording] = useState(false)
    const [currentFlowId, setCurrentFlowId] = useState(null)
    const [flows, setFlows] = useState(() =>
        JSON.parse(localStorage.getItem('flows') || '{}'),
    )

    useEffect(() => {
        const removeEventListeners = listenEvents(storeEvent)
        return () => removeEventListeners()
    }, [recording, currentFlowId, flows])

    function storeEvent(event) {
        if (!recording || !currentFlowId) return
        const updatedEvents = flows[currentFlowId]
            ? [...flows[currentFlowId], event]
            : [event]
        const updatedFlows = { ...flows, [currentFlowId]: updatedEvents }
        setFlows(updatedFlows)
        localStorage.setItem('flows', JSON.stringify(updatedFlows))
    }

    function toggleRecording() {
        if (!recording) {
            const newFlowId = uuidv4()
            setCurrentFlowId(newFlowId)
        } else {
            setCurrentFlowId(null)
        }
        setRecording(!recording)
    }

    return (
        <div className="p-5">
            <RecordButton onClick={toggleRecording} recording={recording} />
        </div>
    )
}
