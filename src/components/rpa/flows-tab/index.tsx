import React, { useRef } from 'react'

import { FlowListItem } from './flow-list-item'
import { useRunnerState } from '~/lib/hooks/runner/use-runner-state'
import { useRecorderState } from '~/lib/hooks/use-recorder-state'

import { RecordButton } from '~/components/rpa/recorder'
import { RunningTask } from './running-task'

export function FlowsTab() {
  const runnerContainerRef = useRef(null)
  const { isRecording, isPaused, isSaving, toggleRecording } = useRecorderState()
  const {
    flows,
    runningTask,
    runningFlow,
    eventsCompleted,
    runFlow,
    updateFlow,
    deleteFlow,
    endTaskRun,
  } = useRunnerState()

  if (runningTask) {
    return (
      <RunningTask
        runningTask={runningTask}
        runningFlow={runningFlow}
        eventsCompleted={eventsCompleted}
        onStop={endTaskRun}
        onPause={() => {}}
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
