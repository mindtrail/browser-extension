import { useCallback, useEffect } from 'react'

import { getTasks } from '~/lib/supabase'
import { executeTask } from '~lib/utils/runner/execution/execute-task'
import { createNewTask, endTask } from '~lib/utils/runner/execution/task-utils'

import { useRunnerService } from './use-runner-service'
import { useEventManager } from './use-event-manager'

export const useRunnerState = () => {
  const {
    flows,
    runnerState,
    setRunnerState,
    resetRunnerState,
    startFlowsRun,
    updateFlow,
    deleteFlow,
    flowQueue,
    isProcessing,
    addToQueue,
    removeFromQueue,
    startProcessing,
    stopProcessing,
  } = useRunnerService()

  const { query } = runnerState
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

      addToQueue(queuedItem)

      if (!isProcessing) {
        processQueue()
      }
    },
    [runnerState.flows, runnerState.query, isProcessing, addToQueue],
  )

  const processQueue = async () => {
    if (flowQueue.length === 0) {
      stopProcessing()
      return
    }

    startProcessing()
    const flowToRun = flowQueue[0]

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

    const resumeTask = async () => {
      const { data = [] } = await getTasks()
      const resumableTasks = data.filter((task) => task?.state?.status !== 'ended')

      if (resumableTasks.length > 0) {
        const resumableTask = resumableTasks[0]
        // console.log(33333, 'resumableTask', resumableTask)
        // runFlow(resumableTask?.state?.flowId)
      }
    }

    if (flows.length > 0) {
      resumeTask()
    }
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
