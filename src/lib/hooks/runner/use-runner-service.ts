import { useEffect, useCallback } from 'react'
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
  const resetRunnerState = useCallback(() => setRunnerState(DEFAULT_RUNNER_STATE), [])

  useEffect(() => {
    const fetchFlows = async () => {
      const { data = [] } = await getFlows()
      setRunnerState((prev) => ({ ...prev, flows: data }))
    }

    fetchFlows()
    const unsubscribe = onFlowsChange(fetchFlows)
    return () => unsubscribe()
  }, [setRunnerState])

  const startFlowsRun = useCallback(async (flowsToRun: any[]) => {
    setRunnerState((prev) => ({
      ...prev,
      flowsRunning: flowsToRun,
    }))
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

  return {
    runnerState,
    setRunnerState,
    resetRunnerState,
    startFlowsRun,
    updateFlow,
    deleteFlow,
  }
}
