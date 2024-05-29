import React, { useState, useEffect, useRef } from 'react'
import { SearchIcon } from 'lucide-react'

import { Input } from '~/components/ui/input'

import {
  getFlows,
  onFlowsChange,
  deleteFlow,
  updateFlow,
  getTasks,
} from '../../../lib/supabase'
import { getFlowsToRun } from './retrieval/get-flows-to-run'
import { runFlows } from './execution/run-flows'
import { RunItem } from './run-item'
import { onTaskStart } from './execution/on-task-start'
import { onEventStart } from './execution/on-event-start'
import { onEventEnd } from './execution/on-event-end'
import { onTaskEnd } from './execution/on-task-end'

export function FlowRunner() {
  const [query, setQuery] = useState('')
  const [flows, setFlows] = useState([])
  const [flowsRunning, setFlowsRunning] = useState([])
  const [eventsRunning, setEventsRunning] = useState(new Map())
  const runnerContainerRef = useRef(null)

  useEffect(() => {
    const fetchFlows = async () => {
      const { data } = await getFlows()
      setFlows(data)
    }
    fetchFlows()
    return onFlowsChange(fetchFlows, 'extension-flows-channel')
  }, [])

  useEffect(() => {
    const resumeTask = async () => {
      const { data } = await getTasks()
      console.log(data)
      const resumableTask = data.filter((task) => task.state.status !== 'ended')[0]
      if (resumableTask) {
        await runFlow(resumableTask.state.flowId, resumableTask)
      }
    }
    if (flows.length > 0) resumeTask()
  }, [flows])

  async function runFlow(flowId: string, task?: any) {
    if (flowsRunning?.length > 0) return

    const flowsToRun = await getFlowsToRun({ flows, flowId, query })

    setFlowsRunning(flowsToRun.map((flow) => flow?.flowId))

    task = task || (await onTaskStart(flowId))
    await runFlows({
      task,
      flows,
      flowsToRun,
      query,
      onEventStart: async (flowId, event) => {
        await onEventStart(flowId, event, task.id)
      },
      onEventEnd: async (flowId, event) => {
        await onEventEnd(flowId, event, task.id)
        setEventsRunning((prevEventsMap) => {
          const prevEvents = prevEventsMap.get(flowId) || []
          return new Map(prevEventsMap).set(flowId, [...prevEvents, event])
        })
      },
    })

    setTimeout(async () => {
      setFlowsRunning([])
      setEventsRunning(new Map())
      await onTaskEnd(flowId, task.id)
    }, 100)
  }

  async function removeFlow(id) {
    await deleteFlow(id)
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
              runFlow={runFlow}
              removeFlow={removeFlow}
              runnerContainerRef={runnerContainerRef}
              updateFlowName={updateFlow}
              eventsRunning={eventsRunning}
            />
          ))}
        </div>
      </div>
    </>
  )
}
