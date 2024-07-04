import { useCallback, useEffect } from 'react'

import { getTasksToRun } from '~/lib/supabase'
import { createNewTask } from '~lib/utils/runner/execution/task-utils'
import { useRunnerService } from './use-runner-service'
import { useFlowService } from './use-flows-service'

export const useRunnerState = () => {
  const { runnerState, setRunnerState, resetRunnerState, flowsQueue, addToQueue } =
    useRunnerService()

  const { query } = runnerState
  const { flows, updateFlow, deleteFlow } = useFlowService()

  const runFlow = useCallback(
    async (flowToRun: any) => {
      if (!flowToRun) return

      const task = await createNewTask(flowToRun.id)

      const queuedItem = {
        ...flowToRun,
        flowId: flowToRun.id,
        eventIds: flowToRun.events.map((event: any) => event.id),
        query,
        task,
      }

      addToQueue([queuedItem])
    },
    [flows, query],
  )

  useEffect(() => {
    if (!flows?.length) return

    const updateQueueWithResumableTasks = async () => {
      const res = await getTasksToRun()

      const { data: tasksToRun = [] } = res
      if (!tasksToRun) return

      console.log(flows, tasksToRun)
      const flowsToResume = []
      for (const task of tasksToRun) {
        const flowToRun = flows.find((flow) => flow.id === task?.state?.flowId)
        if (!flowToRun) continue

        const alreadyInQueue = flowsQueue.some((item) => item.flowId === flowToRun.id)
        if (alreadyInQueue) continue

        const queuedItem = {
          ...flowToRun,
          flowId: flowToRun.id,
          eventIds: flowToRun.events.map((event: any) => event.id),
          query,
          task,
        }

        flowsToResume.push(queuedItem)
      }

      console.log(111, flowsToResume)
      addToQueue(flowsToResume)
    }

    updateQueueWithResumableTasks()
  }, [flows])

  return {
    ...runnerState,
    flows,
    setRunnerState,
    resetRunnerState,
    runFlow,
    updateFlow,
    deleteFlow,
  }
}
