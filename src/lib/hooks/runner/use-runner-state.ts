import { useCallback, useEffect } from 'react'

import { getTasks } from '~/lib/supabase'
import { executeTask } from '~lib/utils/runner/execution/execute-task'
import { createNewTask, endTask } from '~lib/utils/runner/execution/task-utils'

import { useRunnerService } from './use-runner-service'
import { useFlowService } from './use-flows-service'
import { useEventManager } from './use-event-manager'

export const useRunnerState = () => {
  const {
    runnerState,
    setRunnerState,
    resetRunnerState,
    startFlowsRun,
    flowsQueue,
    isProcessing,
    addToQueue,
    removeFromQueue,
    startProcessing,
    stopProcessing,
  } = useRunnerService()

  const { query } = runnerState
  const { flows, updateFlow, deleteFlow } = useFlowService()
  const { onEventStart, onEventEnd } = useEventManager()

  const runFlow = useCallback(
    async (flowToRun: any) => {
      if (!flowToRun) return

      const queuedItem = {
        ...flowToRun,
        flowId: flowToRun.id,
        eventIds: flowToRun.events.map((event: any) => event.id),
        query,
      }

      addToQueue([queuedItem])

      if (!isProcessing) {
        processQueue()
      }
    },
    [flows, query, isProcessing, addToQueue],
  )

  const processQueue = async () => {
    if (flowsQueue.length === 0) {
      stopProcessing()
      return
    }

    startProcessing()
    const flowToRun = flowsQueue[0]

    await startFlowsRun(flowToRun)
    let task = await createNewTask(flowToRun.flowId)

    try {
      await executeTask({
        flowToRun,
        task,
        query,
        onEventStart,
        onEventEnd: (props) => onEventEnd({ ...props, setRunnerState }),
      })
    } finally {
      await endTask(task.id)
      removeFromQueue(flowToRun?.flowId)

      setTimeout(() => {
        resetRunnerState()
        processQueue()
      }, 2000)
    }
  }

  useEffect(() => {
    if (!flows?.length) return

    const updateQueueWithResumableTasks = async () => {
      const { data = [] } = await getTasks()
      const resumableTasks = data.filter((task) => task?.state?.status !== 'ended')

      const flowsToResume = []
      for (const task of resumableTasks) {
        const flowToRun = flows.find((flow) => flow.id === task?.state?.flowId)
        if (!flowToRun) continue

        const alreadyInQueue = flowsQueue.some((item) => item.flowId === flowToRun.id)
        if (alreadyInQueue) continue

        const queuedItem = {
          ...flowToRun,
          flowId: flowToRun.id,
          eventIds: flowToRun.events.map((event: any) => event.id),
          query,
        }

        flowsToResume.push(queuedItem)
      }
      console.log(3333, flowsToResume)

      // addToQueue(flowsToResume)

      if (!isProcessing && flowsQueue.length > 0) {
        // processQueue()
      }
    }

    updateQueueWithResumableTasks()
  }, [flows, flowsQueue, query, addToQueue, isProcessing])

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
