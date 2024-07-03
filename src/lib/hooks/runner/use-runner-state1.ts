import { useCallback, useEffect } from 'react'

import { useRunnerService } from './use-runner-service'
import { useFlowRetrieval } from './use-flow-retrieval'
import { useFlowExecution } from './use-flow-execution'
import { useEventManager } from './use-event-manager'

import { getTasks, createTask, getTask, updateTask, getLastThread } from '~/lib/supabase'

export const useRunnerState = () => {
  const {
    runnerState,
    setRunnerState,
    resetRunnerState,
    startFlowsRun,
    updateFlow,
    deleteFlow,
  } = useRunnerService()

  const { getFlowsToRun } = useFlowRetrieval()
  const { executeFlow } = useFlowExecution()
  const { handleEventStart, handleEventEnd } = useEventManager()

  // Combine the functionalities here
  const runFlow = async (flowId: string, task: any) => {
    const flowsToRun = await getFlowsToRun(flowId, runnerState.flows, runnerState.query)
    await startFlowsRun(flowsToRun)

    task = task || (await onTaskStart(flowId))

    await executeFlow(flowsToRun[0], handleEventStart, handleEventEnd)
    // Additional logic for after flow execution


  }

  return {
    ...runnerState,
    setRunnerState,
    resetRunnerState,
    runFlow,
    updateFlow,
    deleteFlow,
  }
}

async function onTaskStart(flowId: string) {
  const thread = await getLastThread()
  const newTaskRes = await createTask({
    state: {
      status: 'started',
      variables: thread.data,
      flowId,
    },
    logs: [],
  })
  return newTaskRes.data
}
