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
  const [runnerState, setRunnerState] = useStorage(
    RUNNER_CONFIG,
    () => DEFAULT_RUNNER_STATE,
  )

  const { onEventStart, onEventEnd } = useEventManager()
  const [flowsQueue, setFlowsQueue] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)

  const resetRunnerState = useCallback(
    () => setRunnerState({ ...DEFAULT_RUNNER_STATE }),
    [],
  )

  const startFlowsRun = useCallback(async (flowToRun: any[]) => {
    setRunnerState({ ...DEFAULT_RUNNER_STATE, flowRunning: flowToRun })
  }, [])

  const addToQueue = useCallback(
    (newFlows: any[]) => {
      setFlowsQueue((prevQueue) => {
        const newItems = newFlows?.filter(
          (flow) => !prevQueue.some((queuedFlow) => queuedFlow.id === flow.id),
        )
        return [...prevQueue, ...newItems]
      })
    },
    [flowsQueue],
  )

  const removeFromQueue = useCallback(
    (flowId: string) => {
      setFlowsQueue((prevQueue) => {
        console.log(555, flowId, flowsQueue, prevQueue)
        return prevQueue.filter((flow) => flow.id !== flowId)
      })
    },
    [flowsQueue],
  )

  const processQueue = useCallback(async () => {
    if (flowsQueue.length === 0) {
      setIsProcessing(false)
      return
    }

    setIsProcessing(true)
    const { task, query, ...flowToRun } = flowsQueue[0]

    await startFlowsRun(flowToRun)

    try {
      await executeTask({
        task,
        query,
        flowToRun,
        onEventStart,
        onEventEnd: (props) => onEventEnd({ ...props, setRunnerState }),
      })
    } catch (error) {
      await markTaskRetry(task)
    } finally {
      const { logs = [], state } = task
      const lastLog = logs[logs.length - 1]

      console.log(3333, task, flowsQueue, logs)
      if (lastLog && lastLog.status === 'ended') {
        await endTask(task)
        removeFromQueue(flowToRun?.flowId)
      }

      if (state.retries >= 3) {
        await endTask(task, 'failed')
        removeFromQueue(flowToRun?.flowId)
      }

      setTimeout(() => {
        resetRunnerState()
        processQueue()
      }, 2000)
    }
  }, [flowsQueue])

  // when the queue updates, process the queue
  useEffect(() => {
    if (flowsQueue.length > 0 && !isProcessing) {
      processQueue()
    }
  }, [flowsQueue, isProcessing])

  return {
    runnerState,
    setRunnerState,
    resetRunnerState,
    startFlowsRun,
    flowsQueue,
    isProcessing,
    addToQueue,
    removeFromQueue,
    processQueue,
  }
}
