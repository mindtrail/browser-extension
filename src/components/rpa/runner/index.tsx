import React, { useState, useEffect, useRef } from 'react'
import { SearchIcon } from 'lucide-react'

import { Input } from '~/components/ui/input'

import { getFlows, onFlowsChange, deleteFlow } from '../utils/supabase'
import { getFlowsToRun } from './retrieval/get-flows-to-run'
import { runFlows } from './execution/run-flows'
import { RunItem } from './run-item'

export function FlowRunner() {
  const [currentEvents, setCurrentEvents] = useState([])
  const [query, setQuery] = useState('')
  const [flows, setFlows] = useState([])
  const [flowsRunning, setFlowsRunning] = useState([])
  const [runComplete, setRunComplete] = useState(false)

  const runnerContainerRef = useRef(null)

  useEffect(() => {
    const fetchFlows = async () => {
      const { data } = await getFlows()
      setFlows(data)
    }
    fetchFlows()
    return onFlowsChange(fetchFlows)
  }, [])

  async function runFlow(flowId: string) {
    if (flowsRunning?.length > 0) return

    const flowsToRun = await getFlowsToRun({ flows, flowId, query })
    setFlowsRunning(flowsToRun.map((flow) => flow?.flowId))

    setRunComplete(false)
    await runFlows({
      flows,
      flowsToRun,
      query,
      onEvent: (event) => setCurrentEvents((prevEvents) => [...prevEvents, event]),
    })
    setRunComplete(true)

    setTimeout(() => {
      setFlowsRunning([])
      setCurrentEvents([])
    }, 2500)
  }

  async function removeFlow(id) {
    await deleteFlow(id)
    setCurrentEvents([])
  }

  return (
    <>
      <div
        ref={runnerContainerRef}
        className=' flex flex-col gap-4 px-4 py-4 overflow-auto'
      >
        <form
          className='flex items-center'
          onSubmit={(e) => {
            e.preventDefault()
            // runFlow({ query })
          }}
        >
          <Input
            disabled={flowsRunning?.length > 0}
            placeholder='Search Flow'
            className='w-full pl-4 pr-10 border border-gray-300 rounded'
            value={`${flowsRunning?.length ? 'Running ' : ''}${query}`}
            onChange={(e) => setQuery(e.target.value)}
          />

          <SearchIcon className='w-4 h-4 absolute right-8 text-foreground/50' />
        </form>
        <div className='flex flex-col gap-2'>
          {flows?.map((flow, index) => (
            <RunItem
              key={index}
              flow={flow}
              flowsRunning={flowsRunning}
              runComplete={runComplete}
              runFlow={runFlow}
              removeFlow={removeFlow}
              runnerContainerRef={runnerContainerRef}
            />
          ))}
        </div>
      </div>
    </>
  )
}
