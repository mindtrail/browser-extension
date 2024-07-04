import { useEffect, useCallback, useState } from 'react'
import {
  getFlows,
  onFlowsChange,
  updateFlow as updateFlowDBCall,
  deleteFlow as deleteFlowDBCall,
} from '~/lib/supabase'

export const useFlowService = () => {
  const [flows, setFlows] = useState([])

  useEffect(() => {
    const fetchFlows = async () => {
      const { data = [] } = await getFlows()
      setFlows(data)
    }

    fetchFlows()
    const unsubscribe = onFlowsChange(fetchFlows)
    return () => unsubscribe()
  }, [])

  const updateFlow = useCallback(async (flowId: string, payload: any) => {
    await updateFlowDBCall(flowId, payload)
    setFlows((prev) =>
      prev.map((flow) => (flow.id === flowId ? { ...flow, ...payload } : flow)),
    )
  }, [])

  const deleteFlow = useCallback(async (flowId: string) => {
    await deleteFlowDBCall(flowId)
    setFlows((prev) => prev.filter((flow) => flow.id !== flowId))
  }, [])

  return {
    flows,
    updateFlow,
    deleteFlow,
  }
}
