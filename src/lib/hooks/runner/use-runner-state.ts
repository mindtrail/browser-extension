import { useCallback, useEffect } from 'react'

import { getTasksToRun } from '~/lib/supabase'
import { createNewTask, endTask } from '~lib/utils/runner/execution/task-utils'
import { useRunnerService } from './use-runner-service'
import { useFlowService } from './use-flows-service'

export const useRunnerState = () => {
  const { runnerState, setRunnerState, resetRunnerState, addToQueue } = useRunnerService()

  const { query } = runnerState
  const { flows, updateFlow, deleteFlow } = useFlowService()

  const runFlow = useCallback(
    async (flowToRun: any) => {
      if (!flowToRun) return

      const task = await createNewTask(flowToRun.id)
      if (!task) return

      const taskToRun = {
        id: task.id,
        task,
        query,
        flow: flowToRun,
      }

      addToQueue([taskToRun])
    },
    [flows, query],
  )

  const stopFlowRun = useCallback(() => {
    endTask(runnerState.runningTask?.task)
    resetRunnerState()
  }, [])

  useEffect(() => {
    const refreshQueue = async () => {
      const res = await getTasksToRun()

      const { data: tasksToRun = [] } = res

      if (!tasksToRun) {
        resetRunnerState()
        return
      }

      const flowsToResume = []
      for (const task of tasksToRun) {
        const flowToRun = flows.find((flow) => flow.id === task?.state?.flowId)
        if (!flowToRun) continue

        const taskToRun = {
          id: task.id,
          task,
          query,
          flow: flowToRun,
        }

        flowsToResume.push(taskToRun)
      }

      if (!flowsToResume.length) {
        resetRunnerState()
        return
      }

      addToQueue(flowsToResume)
    }

    refreshQueue()
  }, [flows])

  return {
    ...runnerState,
    flows,
    setRunnerState,
    runFlow,
    updateFlow,
    deleteFlow,
    stopFlowRun,
  }
}
