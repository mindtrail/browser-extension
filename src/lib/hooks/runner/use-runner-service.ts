import { useEffect, useCallback, useState } from 'react'
import { Storage } from '@plasmohq/storage'
import { useStorage } from '@plasmohq/storage/hook'
import { STORAGE_AREA, DEFAULT_RUNNER_STATE } from '~/lib/constants'
import { endTask } from '~lib/utils/runner/execution/task-utils'
import { executeTask } from '~lib/utils/runner/execution/execute-task'
import { useEventManager } from './use-event-manager'

const RUNNER_CONFIG = {
  key: STORAGE_AREA.RUNNER,
  instance: new Storage({ area: 'local' }),
}

export const useRunnerService = () => {
  const [runnerState, setRunnerState] = useStorage(RUNNER_CONFIG, DEFAULT_RUNNER_STATE)
  const { runQueue, runningTask } = runnerState
  const { onEventStart, onEventEnd } = useEventManager()
  const [taskRetries, setTaskRetries] = useState(0)

  const resetRunnerState = useCallback(() => setRunnerState(DEFAULT_RUNNER_STATE), [])

  const setrunningTask = useCallback(
    (flow) => setRunnerState((prev) => ({ ...prev, runningTask: flow })),
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
    (taskId: string) => {
      setRunnerState((prev) => ({
        ...prev,
        runQueue: prev.runQueue.filter(({ id }) => id !== taskId),
        runningTask: prev.runningTask?.id === taskId ? null : prev.runningTask,
      }))
    },
    [runQueue],
  )

  const processQueue = useCallback(async () => {
    if (runQueue?.length === 0) {
      resetRunnerState()
      return
    }

    if (!runningTask) {
      const runningTask = runQueue[0]
      setrunningTask(runningTask)
      setTaskRetries(0)
      return
    }
  }, [runQueue])

  // When the queue updates, process the queue
  useEffect(() => {
    if (runQueue.length > 0) {
      processQueue()
    }
  }, [runQueue])

  console.log(1111, taskRetries, runQueue, runningTask)

  useEffect(() => {
    if (!runningTask) return

    const executeFlowTasks = async () => {
      const { task, query, ...flow } = runningTask
      if (!task || !flow) return

      try {
        await executeTask({
          task,
          query,
          flow,
          onEventStart,
          onEventEnd: (props) => onEventEnd({ ...props, setRunnerState }),
        })
      } catch (error) {
        setTaskRetries(taskRetries + 1)

        if (taskRetries >= 1) {
          console.log(3333, 'failed')
          await endTask(task, 'failed')
          removeFromQueue(flow?.id)
        }
        return
      }

      const { logs = [] } = task
      const lastLog = logs[logs.length - 1]

      if (lastLog && lastLog.status === 'ended') {
        await endTask(task)
        removeFromQueue(flow?.id)
      }
    }

    executeFlowTasks()
  }, [runningTask, taskRetries])

  return {
    runnerState,
    setRunnerState,
    resetRunnerState,
    addToQueue,
    removeFromQueue,
  }
}
