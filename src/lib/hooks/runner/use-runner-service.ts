import { useEffect, useCallback, useState } from 'react'
import { Storage } from '@plasmohq/storage'
import { useStorage } from '@plasmohq/storage/hook'
import { STORAGE_AREA, DEFAULT_RUNNER_STATE } from '~/lib/constants'
import {
  getFlows,
  onFlowsChange,
  updateFlow as updateFlowDBCall,
  deleteFlow as deleteFlowDBCall,
} from '~/lib/supabase'

const RUNNER_CONFIG = {
  key: STORAGE_AREA.RUNNER,
  instance: new Storage({ area: 'local' }),
}

export const useRunnerService = () => {
  const [runnerState, setRunnerState] = useStorage(RUNNER_CONFIG, DEFAULT_RUNNER_STATE)

  const [flows, setFlows] = useState([])
  const [flowQueue, setFlowQueue] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)

  const resetRunnerState = useCallback(
    () => setRunnerState({ ...DEFAULT_RUNNER_STATE }),
    [],
  )

  useEffect(() => {
    const fetchFlows = async () => {
      const { data = [] } = await getFlows()
      setFlows(data)
    }

    fetchFlows()
    const unsubscribe = onFlowsChange(fetchFlows)
    return () => unsubscribe()
  }, [])

  const startFlowsRun = useCallback(async (flowToRun: any[]) => {
    setRunnerState({ ...DEFAULT_RUNNER_STATE, flowRunning: flowToRun })
  }, [])

  const updateFlow = useCallback(async (flowId: string, payload: any) => {
    await updateFlowDBCall(flowId, payload)

    setRunnerState((prev) => ({
      ...prev,
      flows: prev.flows.map((flow) =>
        flow.id === flowId ? { ...flow, ...payload } : flow,
      ),
    }))
  }, [])

  const deleteFlow = useCallback(async (flowId: string) => {
    await deleteFlowDBCall(flowId)
    setRunnerState((prev) => ({
      ...prev,
      flows: prev.flows.filter((flow) => flow.id !== flowId),
    }))
  }, [])

  const addToQueue = useCallback((queuedItem: any) => {
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
  }
}
