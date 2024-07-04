import { useEffect, useCallback } from 'react'
import { Storage } from '@plasmohq/storage'
import { useStorage } from '@plasmohq/storage/hook'
import { STORAGE_AREA, DEFAULT_RUNNER_STATE } from '~/lib/constants'
import { endTask, markTaskRetry } from '~lib/utils/runner/execution/task-utils'
import { executeTask } from '~lib/utils/runner/execution/execute-task'
import { useEventManager } from './use-event-manager'

const RUNNER_CONFIG = {
  key: STORAGE_AREA.RUNNER,
  instance: new Storage({ area: 'local' }),
}

export const useRunnerService = () => {
  const [runnerState, setRunnerState] = useStorage(RUNNER_CONFIG, DEFAULT_RUNNER_STATE)
  const { runQueue, runningFlow } = runnerState
  const { onEventStart, onEventEnd } = useEventManager()

  const resetRunnerState = useCallback(() => setRunnerState(DEFAULT_RUNNER_STATE), [])

  const setRunningFlow = useCallback(
    (flow) => setRunnerState((prev) => ({ ...prev, runningFlow: flow })),
    [runQueue],
  )

  const addToQueue = useCallback(
    (newFlows: any[]) => {
      setRunnerState((prev) => ({
        ...prev,
        runQueue: [
          ...prev.runQueue,
          ...newFlows.filter(
            (flow) => !prev.runQueue.some((queuedFlow) => queuedFlow.id === flow.id),
          ),
        ],
      }))
    },
    [runQueue],
  )

  const removeFromQueue = useCallback(
    (flowId: string) => {
      setRunnerState((prev) => ({
        ...prev,
        runQueue: prev.runQueue.filter((flow) => flow.id !== flowId),
      }))
    },
    [runQueue],
  )

  const processQueue = useCallback(async () => {
    if (runQueue?.length === 0) {
      resetRunnerState()
      return
    }

    const runningFlow = runQueue[0]
    setRunningFlow(runningFlow)

    const { task, query, ...flow } = runningFlow
    if (!task || !flow) return

    let taskRetries = task?.state?.retries || 0
    console.log(1111, task, query, flow, taskRetries)

    try {
      await executeTask({
        task,
        query,
        flow,
        onEventStart,
        onEventEnd: (props) => onEventEnd({ ...props, setRunnerState }),
      })
    } catch (error) {
      taskRetries += 1
      markTaskRetry(task, taskRetries)

      // task.state.retries = taskRetries
      setRunningFlow({
        ...runningFlow,
        task: { ...task, state: { ...task.state, retries: taskRetries } },
      })
    } finally {
      const { logs = [] } = task
      const lastLog = logs[logs.length - 1]

      if (lastLog && lastLog.status === 'ended') {
        await endTask(task)
        removeFromQueue(flow?.id)
      }

      if (taskRetries >= 3) {
        await endTask(task, 'failed')
        removeFromQueue(flow?.id)
      }

      setTimeout(() => {
        resetRunnerState()
        processQueue()
      }, 1000)
    }
  }, [runQueue, runningFlow])

  // when the queue updates, process the queue
  useEffect(() => {
    if (runQueue.length > 0) {
      processQueue()
    }
  }, [runQueue])

  return {
    runnerState,
    setRunnerState,
    resetRunnerState,
    addToQueue,
    removeFromQueue,
    processQueue,
  }
}
