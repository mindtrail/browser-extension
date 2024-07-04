import React, { useRef } from 'react'

import { FlowListItem } from './flow-list-item'
import { useRunnerState } from '~lib/hooks/runner/use-runner-state'
import { useRecorderState } from '~/lib/hooks/use-recorder-state'

import { RecordButton } from '~/components/rpa/recorder'
import { RunningFlow } from './running-flow'

export function FlowsTab() {
  const { isRecording, isPaused, isSaving, toggleRecording } = useRecorderState()
  const { flows, runningFlow, eventsCompleted, runFlow, updateFlow, deleteFlow } =
    useRunnerState()

  const runnerContainerRef = useRef(null)

  if (runningFlow) {
    return (
      <RunningFlow
        runningFlow={runningFlow}
        flows={flows}
        eventsCompleted={eventsCompleted}
      />
    )
  }

  return (
    <div className='flex flex-col flex-1 justify-between gap-2 '>
      <div ref={runnerContainerRef} className='flex flex-col gap-4 overflow-auto'>
        <div className='flex flex-col gap-2'>
          {flows?.map((flow, index) => (
            <FlowListItem
              key={index}
              flow={flow}
              runFlow={runFlow}
              removeFlow={deleteFlow}
              runnerContainerRef={runnerContainerRef}
              updateFlowName={updateFlow}
            />
          ))}
        </div>
      </div>

      <div className='w-full'>
        <RecordButton
          onToggleRecording={toggleRecording}
          isRecording={isRecording}
          isPaused={isPaused}
          isSaving={isSaving}
        />
      </div>
    </div>
  )
}
