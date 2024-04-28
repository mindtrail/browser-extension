import React, { useState } from 'react'
import { runEvents } from './run-events'
import { mergeInputEvents } from '../utils/merge-input-events'
import { discardClickInputEvents } from '../utils/discard-click-input-events'
import { Actions } from '../actions'
import { buildInputData } from './build-input-data'
import { generateFormData } from '~/lib/llm'

export function FlowRunner({ flows, setFlows }) {
  const [hoveredFlowId, setHoveredFlowId] = useState(null)
  const [currentEvents, setCurrentEvents] = useState([])
  const [llmQuery, setLlmQuery] = useState('')

  function getFlowEvents(flowId) {
    let events = flows[flowId]?.events || []
    events = mergeInputEvents(events)
    events = discardClickInputEvents(events)
    return events
  }

  async function runFlow(flowId) {
    console.log('running flow')
    setCurrentEvents([])
    const events = getFlowEvents(flowId)
    const data = llmQuery
      ? await generateFormData(
          `${llmQuery} in this format: ${JSON.stringify(buildInputData(events))}`,
        )
      : {}
    console.log(llmQuery, events, data)
    await runEvents({
      events,
      data,
      callback: (event) => setCurrentEvents((prevEvents) => [...prevEvents, event]),
    })
  }

  function removeFlow(flowId) {
    const updatedFlows = { ...flows }
    delete updatedFlows[flowId]
    setFlows(updatedFlows)
    localStorage.setItem('flows', JSON.stringify(updatedFlows))
    setCurrentEvents([])
  }
  console.log(llmQuery)

  return (
    <div className='px-4'>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          runFlow(Object.keys(flows)[0])
        }}
      >
        {/* <input
          name='llm-query'
          type='text'
          className='w-full p-2 border border-gray-300 rounded mb-3'
          value={llmQuery}
          onChange={(e) => setLlmQuery(e.target.value)}
        /> */}
      </form>
      {Object.keys(flows).map((flowId, index) => (
        <div
          key={flowId}
          className='relative group block'
          onMouseEnter={() => setHoveredFlowId(flowId)}
          onMouseLeave={() => setHoveredFlowId(null)}
        >
          <button
            className='bg-blue-500 text-white px-5 py-2.5 mt-3 rounded w-full'
            onClick={() => runFlow(flowId)}
          >
            {flows[flowId].name}
          </button>
          <button
            className={`absolute top-1 right-[-7px] p-1 rounded-full bg-gray-500 text-white ${
              hoveredFlowId === flowId ? 'opacity-100' : 'opacity-0'
            } transition-opacity duration-300 ease-in-out`}
            onClick={() => removeFlow(flowId)}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='12'
              height='12'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>
      ))}
      <Actions events={currentEvents} />
    </div>
  )
}
