import { useCallback, useEffect } from 'react'

import { getTasks } from '~/lib/supabase'
import { getFlowsToRun } from '~lib/utils/runner/retrieval/get-flows-to-run'
import { runFlows } from '~lib/utils/runner/execution/run-flows'
import { onTaskStart, onTaskEnd } from '~lib/utils/runner/execution/task-utils'

import { useRunnerService } from './use-runner-service'
import { useEventManager } from './use-event-manager'

export const useRunnerState = () => {
  const {
    runnerState,
    setRunnerState,
    resetRunnerState,
    startFlowsRun,
    updateFlow,
    deleteFlow,
  } = useRunnerService()

  const { flows, query } = runnerState
  const { handleEventStart, handleEventEnd } = useEventManager()

  // Combine the functionalities here
  const runFlow = useCallback(
    async (flowId: string, task: any) => {
      const flowsToRun = await getFlowsToRun({ flowId, flows, query })

      await startFlowsRun(flowsToRun)
      task = task || (await onTaskStart(flowId))
      await runFlows({
        flowId,
        task,
        flows,
        flowsToRun,
        query,
        onEventStart: handleEventStart,
        onEventEnd: (props) => handleEventEnd({ ...props, setRunnerState }),
      })

      setTimeout(() => {
        resetRunnerState()
        onTaskEnd(task.id)
      }, 2000)
    },
    [flows, query],
  )

  useEffect(() => {
    if (!flows?.length) return

    const resumeTask = async () => {
      const { data = [] } = await getTasks()
      const resumableTask = data.filter((task) => task?.state?.status !== 'ended')[0]

      if (resumableTask) {
        runFlow(resumableTask?.state?.flowId, resumableTask)
      }
    }

    if (flows.length > 0) {
      resumeTask()
    }
  }, [flows])

  return {
    ...runnerState,
    setRunnerState,
    resetRunnerState,
    runFlow,
    updateFlow,
    deleteFlow,
  }
}
