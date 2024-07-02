import React, { useRef } from 'react'

import { FlowListItem } from './flow-list-item'
import { useRunnerState } from '~lib/hooks/use-runner-state'

export function FlowList() {
  const { flows, flowsRunning, eventsList, runFlow, updateFlow, deleteFlow } =
    useRunnerState()

  const runnerContainerRef = useRef(null)

  return (
    <div ref={runnerContainerRef} className='flex flex-col gap-4 overflow-auto'>
      <div className='flex flex-col gap-2'>
        {flows?.map((flow, index) => (
          <FlowListItem
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
  )
}
