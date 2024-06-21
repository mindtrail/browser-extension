import React, { useRef } from 'react'
import { SearchIcon } from 'lucide-react'

import { Input } from '~/components/ui/input'

import { RunItem } from './run-item'
import { useRunnerState } from '~lib/hooks/use-runner-state'

export function FlowRunner() {
  const {
    query,
    flows,
    flowsRunning,
    eventsList,
    setRunnerState,
    runFlow,
    updateFlow,
    deleteFlow,
  } = useRunnerState()

  const runnerContainerRef = useRef(null)

  return (
    <>
      <div ref={runnerContainerRef} className='flex flex-col gap-4 py-1 overauto'>
        {/* <form
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
            onChange={(e) =>
              setRunnerState((prev) => ({ ...prev, query: e.target.value }))
            }
          />

          <SearchIcon className='w-4 h-4 absolute right-8 text-foreground/50' />
        </form> */}
        <div className='flex flex-col gap-2'>
          {flows?.map((flow, index) => (
            <RunItem
              key={index}
              flow={flow}
              flowsRunning={flowsRunning}
              runFlow={runFlow}
              removeFlow={deleteFlow}
              runnerContainerRef={runnerContainerRef}
              updateFlowName={updateFlow}
              eventsList={eventsList}
            />
          ))}
        </div>
      </div>
    </>
  )
}
