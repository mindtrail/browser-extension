import { useEffect, useCallback, useState } from 'react'
import { Storage } from '@plasmohq/storage'
import { useStorage } from '@plasmohq/storage/hook'

import { STORAGE_AREA, DEFAULT_RUNNER_STATE } from '~/lib/constants'
import { endTask } from '~lib/utils/runner/execution/task-utils'
import { executeTask } from '~lib/utils/runner/execution/execute-task'
import { handleEventStart, handleEventEnd } from '~/lib/utils/runner/execution/task-utils'

const RUNNER_CONFIG = {
  key: STORAGE_AREA.RUNNER,
  instance: new Storage({ area: 'local' }),
}

export const useRunnerService = () => {
  const [runnerState, setRunnerState] = useStorage(RUNNER_CONFIG, DEFAULT_RUNNER_STATE)
  const { runQueue, runningTask } = runnerState

  const [taskRetries, setTaskRetries] = useState(0)

  const resetRunnerState = useCallback(() => setRunnerState(DEFAULT_RUNNER_STATE), [])

  const addToQueue = useCallback((newFlows: any[]) => {
    setRunnerState((prev) => ({
      ...prev,
      runQueue: [
        ...prev.runQueue,
        ...newFlows.filter(
          (flow) => !prev.runQueue.some((queuedFlow) => queuedFlow.id === flow.id),
        ),
      ],
    }))
  }, [])

  const removeFromQueue = useCallback((taskId: string) => {
    setRunnerState((prev) => ({
      ...prev,
      runQueue: prev.runQueue.filter(({ id }) => id !== taskId),
      runningTask: prev.runningTask?.id === taskId ? null : prev.runningTask,
    }))
  }, [])

  const onEventEnd = useCallback(async (props: OnEventEndProps) => {
    await handleEventEnd(props)
    const { event: newEvent } = props

    setRunnerState((prev) => {
      const eventAlreadyMarked = prev?.eventsCompleted?.some((e) => e.id === newEvent.id)
      if (eventAlreadyMarked) return prev

      return {
        ...prev,
        eventsCompleted: [...(prev?.eventsCompleted || []), newEvent],
      }
    })
  }, [])

  // When the queue updates, process the first task
  useEffect(() => {
    if (runQueue?.length === 0) {
      resetRunnerState()
      return
    }

    if (!runningTask) {
      const runningTask = runQueue[0]
      setRunnerState((prev) => ({ ...prev, runningTask }))
      setTaskRetries(0)
    }
  }, [runQueue])

  useEffect(() => {
    if (!runningTask) return

    const executeFlowTasks = async () => {
      const { task, query, flow, id: taskId } = runningTask
      console.log(111, taskRetries)

      console.log(taskRetries)
      if (taskRetries >= 3) {
        console.log(3333, 'failed')

        await endTask(task, 'failed')
        removeFromQueue(taskId)
        return
      }

      try {
        console.log(222, 'executeTask')
        await executeTask({
          task,
          query,
          flow,
          onEventStart: handleEventStart,
          onEventEnd,
        })
      } catch (error) {
        console.log(333, 'error', error)
        setTaskRetries(taskRetries + 1)
        return
      }

      const { logs = [] } = task
      const lastLog = logs[logs.length - 1]

      console.log(logs)
      if (lastLog && lastLog.status === 'ended') {
        await endTask(task)
        removeFromQueue(taskId)
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
