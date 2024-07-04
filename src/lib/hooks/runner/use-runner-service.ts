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

  const { onEventStart, onEventEnd } = useEventManager()
  const { isRunning, flowsQueue } = runnerState

  const resetRunnerState = useCallback(
    () => setRunnerState({ ...DEFAULT_RUNNER_STATE }),
    [],
  )

  const startFlowsRun = useCallback((flowToRun: any[]) => {
    setRunnerState({ ...DEFAULT_RUNNER_STATE, flowRunning: flowToRun })
  }, [])

  const addToQueue = useCallback(
    (newFlows: any[]) => {
      setRunnerState(({ flowsQueue: existingQueue, ...runnerState }) => ({
        ...runnerState,
        flowsQueue: [
          ...existingQueue,
          ...newFlows.filter(
            (flow) => !existingQueue.some((queuedFlow) => queuedFlow.id === flow.id),
          ),
        ],
      }))
    },
    [flowsQueue],
  )

  const removeFromQueue = useCallback(
    (flowId: string) => {
      setRunnerState((prev) => ({
        ...prev,
        flowsQueue: prev.flowsQueue.filter((flow) => flow.id !== flowId),
      }))
    },
    [flowsQueue],
  )

  const updateQueueItem = useCallback(
    (flowId: string, newState: any) => {
      setRunnerState((prev) => ({
        ...prev,
        flowsQueue: prev.flowsQueue.map((flow) => (flow.id === flowId ? newState : flow)),
      }))
    },
    [flowsQueue],
  )

  const processQueue = useCallback(async () => {
    if (flowsQueue.length === 0) {
      setRunnerState((prev) => ({ ...prev, isRunning: false }))
      return
    }

    if (!isRunning) {
      setRunnerState((prev) => ({ ...prev, isRunning: true }))
    }

    const flowRunning = flowsQueue[0]
    const { task, query, ...flowToRun } = flowRunning

    startFlowsRun(flowToRun)
    console.log(1111, task, query, flowToRun)

    let taskRetries = task?.state?.retries || 0

    try {
      await executeTask({
        task,
        query,
        flowToRun,
        onEventStart,
        onEventEnd: (props) => onEventEnd({ ...props, setRunnerState }),
      })
    } catch (error) {
      console.log(2222, error)

      taskRetries += 1
      markTaskRetry(task, taskRetries)
      updateQueueItem(flowToRun.id, {
        ...flowRunning,
        task: { ...task, state: { ...task.state, retries: taskRetries } },
      })
    } finally {
      const { logs = [] } = task
      const lastLog = logs[logs.length - 1]

      console.log(3333, task, flowsQueue, logs)
      if (lastLog && lastLog.status === 'ended') {
        await endTask(task)
        removeFromQueue(flowToRun?.flowId)
      }

      if (taskRetries >= 3) {
        await endTask(task, 'failed')
        removeFromQueue(flowToRun?.flowId)
      }

      setTimeout(() => {
        resetRunnerState()
        processQueue()
      }, 1000)
    }
  }, [runnerState])

  // when the queue updates, process the queue
  useEffect(() => {
    if (flowsQueue.length > 0 && !isRunning) {
      processQueue()
    }
  }, [flowsQueue, isRunning])

  return {
    runnerState,
    setRunnerState,
    resetRunnerState,
    startFlowsRun,
    addToQueue,
    removeFromQueue,
    processQueue,
  }
}
