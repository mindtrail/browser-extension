import { useCallback, useEffect } from 'react'

import { getTasksToRun } from '~/lib/supabase'
import { createNewTask, endTask } from '~lib/utils/runner/execution/task-utils'
import { useRunnerService } from './use-runner-service'
import { useFlowService } from './use-flows-service'

export const useRunnerState = () => {
  const { runnerState, resetRunnerState, addToQueue, endTaskRun } = useRunnerService()
  const { flows, updateFlow, deleteFlow } = useFlowService()

  const runFlow = useCallback(
    async (flowToRun: any, query: string = '') => {
      if (!flowToRun) return

      const task = await createNewTask(flowToRun.id)
      if (!task) return

      const taskToRun = {
        task,
        query, // @TODO: the query should come from where the run function is called
        flow: flowToRun,
      }

      addToQueue([taskToRun])
    },
    [flows],
  )
  useEffect(() => {
    const refreshQueue = async () => {
      const result = await getTasksToRun()
      const { data: tasksToRun = [] } = result

      if (!tasksToRun) {
        resetRunnerState()
        return
      }

      const tasksToResume = []
      for (const task of tasksToRun) {
        const flowToRun = flows.find((flow) => flow.id === task?.state?.flowId)
        if (!flowToRun) continue

        const taskToRun = {
          task,
          query: '', // @TODO: check if the query needs to come from the Task this time
          flow: flowToRun,
        }

        tasksToResume.push(taskToRun)
      }

      if (!tasksToResume.length) {
        resetRunnerState()
        return
      }

      addToQueue(tasksToResume)
    }

    refreshQueue()
  }, [flows])

  return {
    ...runnerState,
    flows,
    runFlow,
    updateFlow,
    deleteFlow,
    endTaskRun,
  }
}
