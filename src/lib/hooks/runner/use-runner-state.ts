import { useCallback, useEffect } from 'react'

import { getTasksToRun } from '~/lib/supabase'
import { createNewTask } from '~lib/utils/runner/execution/task-utils'
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

      console.log(2222, flowToRun)
      const queueItem = {
        id: task.id,
        task,
        flow: flowToRun,
        query,
      }

      addToQueue([queueItem])
    },
    [flows, query],
  )

  useEffect(() => {
    const retreshQueue = async () => {
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

        const queuedItem = {
          id: task.id,
          task,
          flow: flowToRun,
          query,
        }

        flowsToResume.push(queuedItem)
      }

      if (!flowsToResume.length) {
        resetRunnerState()
        return
      }

      addToQueue(flowsToResume)
    }

    retreshQueue()
  }, [flows])

  return {
    ...runnerState,
    flows,
    setRunnerState,
    runFlow,
    updateFlow,
    deleteFlow,
  }
}
