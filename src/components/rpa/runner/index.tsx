import React, { useState, useEffect } from 'react'

import { runEvents } from './run-events'
import { buildParamsSchema } from './build-params-schema'
import { parseQuery } from './parse-query'

import { Actions } from '../actions'
import { discardClickInputEvents } from '../utils/discard-click-input-events'
import { getFlows, onFlowsChange, deleteFlow } from '../utils/supabase'
import { mergeInputEvents } from '../utils/merge-input-events'
import { extractParams } from '../utils/openai'

import { SendHorizonalIcon, Trash2Icon } from 'lucide-react'
import { Button } from '~components/ui/button'
import { Input } from '~/components/ui/input'

type RunFlowParams = {
  flowId?: string
  query?: string
}

export function FlowRunner() {
  const [hoveredFlowId, setHoveredFlowId] = useState(null)
  const [currentEvents, setCurrentEvents] = useState([])
  const [query, setQuery] = useState('')
  const [flows, setFlows] = useState([])
  const [runInProgress, setRunInProgress] = useState(false)

  useEffect(() => {
    const fetchFlows = async () => {
      const { data } = await getFlows()
      setFlows(data)
    }
    fetchFlows()
    return onFlowsChange(fetchFlows)
  }, [])

  function getFlowEvents(id) {
    let events = flows.find((flow) => flow.id === id)?.events || []
    events = mergeInputEvents(events)
    events = discardClickInputEvents(events)
    return events
  }

  async function runFlow({ flowId, query }: RunFlowParams) {
    if (runInProgress) return

    setRunInProgress(true)
    const flowsToRun = flowId ? [{ flowId }] : await parseQuery(query, flows)

    for (const { flowId } of flowsToRun) {
      setCurrentEvents([])
      const events = getFlowEvents(flowId)
      const data = await extractParams(query, buildParamsSchema(events))
      await runEvents({
        events,
        data,
        onEvent: (event) => setCurrentEvents((prevEvents) => [...prevEvents, event]),
      })
    }

    setRunInProgress(false)
    setCurrentEvents([])
  }

  async function removeFlow(id) {
    await deleteFlow(id)
    setCurrentEvents([])
  }

  return (
    <div className='px-4 py-4 gap-4 flex flex-col'>
      <form
        className='flex items-center'
        onSubmit={(e) => {
          e.preventDefault()
          runFlow({ query })
        }}
      >
        <Input
          disabled={runInProgress}
          placeholder='Run a flow'
          className='w-full pl-4 pr-10 border border-gray-300 rounded'
          value={`${runInProgress ? 'Running: ' : ''}${query}`}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button
          variant='ghost'
          disabled={runInProgress}
          className={`${query?.length > 2 && '!visible'} invisible absolute right-4`}
          type='submit'
        >
          <SendHorizonalIcon className='w-4 h-4 text-primary' />
        </Button>
      </form>
      <div className='flex flex-col gap-2'>
        {flows?.map(({ id: flowId, name }) => (
          <div key={flowId} className='flex items-center relative group/runner'>
            <Button
              variant='secondary'
              className='w-full line-clamp-2 h-auto justify-start text-left'
              onClick={() => runFlow({ flowId: flowId, query })}
            >
              {name}
            </Button>
            <Button
              variant='ghost'
              className={`absolute right-0 rounded opacity-0
                group-hover/runner:opacity-100 transition duration-300 ease-in-out`}
              onClick={() => removeFlow(flowId)}
            >
              <Trash2Icon className='w-4 h-4 text-foreground/70' />
            </Button>
          </div>
        ))}
      </div>

      <Actions events={currentEvents} />
    </div>
  )
}
