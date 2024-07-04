import { useEffect, useCallback, useState } from 'react'
import { Storage } from '@plasmohq/storage'
import { useStorage } from '@plasmohq/storage/hook'
import { STORAGE_AREA, DEFAULT_RUNNER_STATE } from '~/lib/constants'

const RUNNER_CONFIG = {
  key: STORAGE_AREA.RUNNER,
  instance: new Storage({ area: 'local' }),
}

export const useRunnerService = () => {
  const [runnerState, setRunnerState] = useStorage(RUNNER_CONFIG, DEFAULT_RUNNER_STATE)

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

  const startProcessing = useCallback(() => {
    setIsProcessing(true)
  }, [])

  const stopProcessing = useCallback(() => {
    setIsProcessing(false)
  }, [])

  return {
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
  }
}
