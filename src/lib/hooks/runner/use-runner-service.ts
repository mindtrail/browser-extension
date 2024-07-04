import { useEffect, useCallback, useState } from 'react'
import { Storage } from '@plasmohq/storage'
import { useStorage } from '@plasmohq/storage/hook'
import { STORAGE_AREA, DEFAULT_RUNNER_STATE } from '~/lib/constants'
import { createNewTask, endTask } from '~lib/utils/runner/execution/task-utils'
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
  const [flowsQueue, setFlowQueue] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)

  const resetRunnerState = useCallback(
    () => setRunnerState({ ...DEFAULT_RUNNER_STATE }),
    [],
  )

  const startFlowsRun = useCallback(async (flowToRun: any[]) => {
    setRunnerState({ ...DEFAULT_RUNNER_STATE, flowRunning: flowToRun })
  }, [])

  const addToQueue = useCallback((newFlows: any[]) => {
    setFlowQueue((prevQueue) => {
      const newItems = newFlows?.filter(
        (flow) => !prevQueue.some((queuedFlow) => queuedFlow.id === flow.id),
      )
      return [...prevQueue, ...newItems]
    })
  }, [])

  const removeFromQueue = useCallback((flowId: string) => {
    setFlowQueue((prevQueue) => prevQueue.filter((flow) => flow.id !== flowId))
  }, [])

  const processQueue = useCallback(async () => {
    if (flowsQueue.length === 0) {
      setIsProcessing(false)
      return
    }

    setIsProcessing(true)
    const flowToRun = flowsQueue[0]

    await startFlowsRun(flowToRun)
    let task = await createNewTask(flowToRun.flowId)

    try {
      await executeTask({
        flowToRun,
        task,
        query: runnerState.query,
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
