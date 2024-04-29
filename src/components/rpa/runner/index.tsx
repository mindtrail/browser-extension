import React, { useState, useEffect } from 'react'

import { runEvents } from './run-events'
import { buildParamsSchema } from './build-params-schema'
import { parseQuery } from './parse-query'

import { Actions } from '../actions'
import { discardClickInputEvents } from '../utils/discard-click-input-events'
import { getFlows, onFlowsChange, deleteFlow } from '../utils/supabase'
import { mergeInputEvents } from '../utils/merge-input-events'
import { extractParams } from '../utils/openai'

import { SendHorizonalIcon, Trash2Icon, CheckCheckIcon } from 'lucide-react'
import { Button } from '~components/ui/button'
import { Input } from '~/components/ui/input'
import { Typography } from '~components/typography'

type RunFlowParams = {
  flowId?: string
  query?: string
}

const mock_event = {
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

  function getFlowEvents(id) {
    let events = flows.find((flow) => flow.id === id)?.events || []
    events = mergeInputEvents(events)
    events = discardClickInputEvents(events)
    return events
  }

  async function runFlow({ flowId, query }: RunFlowParams) {
    if (flowsRunning?.length > 0) return

    const flowsToRun = flowId ? [{ flowId }] : await parseQuery(query, flows)
    setFlowsRunning(flowsToRun.map((flow) => flow.flowId))
    setRunComplete(false)

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
            runFlow({ query })
          }}
        >
          <Input
            disabled={flowsRunning?.length > 0}
            placeholder='Type flow to run'
            className='w-full pl-4 pr-10 border border-gray-300 rounded'
            value={`${flowsRunning?.length ? 'Running ' : ''}${query}`}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button
            variant='ghost'
            disabled={flowsRunning?.length > 0}
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
                variant={flowsRunning?.includes(flowId) ? 'default' : 'secondary'}
                className='w-full line-clamp-2 h-auto justify-start text-left'
                onClick={() => runFlow({ flowId: flowId, query })}
              >
                {name}
              </Button>
              <Button
                variant='ghost'
                className={`absolute right-0 rounded opacity-0
                group-hover/runner:opacity-100 transition ease-in-out`}
                onClick={() => removeFlow(flowId)}
              >
                <Trash2Icon className='w-4 h-4 text-foreground/70' />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className='flex flex-col max-h-[50%] overflow-auto'>
        <Actions events={currentEvents} readOnly={true} />
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
