import React, { useState, useEffect } from 'react'

import { SendHorizonalIcon, SearchIcon, CheckCheckIcon } from 'lucide-react'
import { Button } from '~components/ui/button'
import { Input } from '~/components/ui/input'
import { Typography } from '~components/typography'

import { getFlows, onFlowsChange, deleteFlow } from '../utils/supabase'
import { Events } from '../events'
import { getFlowsToRun } from './retrieval/get-flows-to-run'
import { runFlows } from './execution/run-flows'
import { FlowItem } from './flow-item'

const mock_event = {
  id: Date.now(),
  delay: 0,
  name: '',
  selector: 'label > button',
  textContent: 'BUTTON',
  type: 'click',
  value: undefined,
}

export function FlowRunner() {
  const [currentEvents, setCurrentEvents] = useState([])
  const [query, setQuery] = useState('')
  const [flows, setFlows] = useState([])
  const [flowsRunning, setFlowsRunning] = useState([])
  const [runComplete, setRunComplete] = useState(false)

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
      <div className=' flex flex-col gap-4 px-4 py-4 overflow-auto'>
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
            <FlowItem
              key={index}
              flow={flow}
              flowsRunning={flowsRunning}
              runFlow={runFlow}
              removeFlow={removeFlow}
            />
          ))}
        </div>
      </div>

      <div className='flex flex-col max-h-[50%] overflow-auto'>
        <Events eventsList={currentEvents} readOnly={true} />
      </div>

      {runComplete && flowsRunning?.length > 0 && (
        <Typography
          variant='small-semi'
          className='flex items-center gap-2 px-6 text-primary'
        >
          <CheckCheckIcon className='w-5 h-5' />
          Run complete
        </Typography>
      )}
    </>
  )
}
