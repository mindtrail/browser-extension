import { useEffect, useCallback, useState } from 'react'
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
  const { runQueue } = runnerState

  const { onEventStart, onEventEnd } = useEventManager()

  const resetRunnerState = useCallback(
    () => setRunnerState({ ...DEFAULT_RUNNER_STATE }),
    [],
  )

  const startFlowsRun = useCallback(
    (runningFlow: any) => {
      setRunnerState((prev) => ({ ...prev, runningFlow }))
    },
    [runQueue],
  )

  const addToQueue = useCallback(
    (newFlows: any[]) => {
      setRunnerState(({ runQueue: existingQueue, ...runnerState }) => ({
        ...runnerState,
        runQueue: [
          ...existingQueue,
          ...newFlows.filter(
            (flow) => !existingQueue.some((queuedFlow) => queuedFlow.id === flow.id),
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

  const updateQueueItem = useCallback(
    (flowId: string, newState: any) => {
      setRunnerState((prev) => ({
        ...prev,
        runQueue: prev.runQueue.map((flow) => (flow.id === flowId ? newState : flow)),
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
    startFlowsRun(runningFlow)

    const { task, query, ...flow } = runningFlow
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
      console.log(2222, error)

      taskRetries += 1
      markTaskRetry(task, taskRetries)
      updateQueueItem(flow.id, {
        ...runningFlow,
        task: { ...task, state: { ...task.state, retries: taskRetries } },
      })
    } finally {
      const { logs = [] } = task
      const lastLog = logs[logs.length - 1]

      console.log(3333, task, runQueue, logs)
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
  }, [runnerState.runQueue, runnerState.runningFlow])

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
