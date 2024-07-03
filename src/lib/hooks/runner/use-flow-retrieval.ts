import { useCallback } from 'react'
import { getFlowEvents } from '~lib/utils/runner/get-flow-events'
import { parseQuery } from '~lib/utils/runner/retrieval/parse-query'

export const useFlowRetrieval = () => {
  const getFlowsToRun = useCallback(async (flowId, flows, query) => {
    if (flowId) {
      const flowEvents = getFlowEvents(flows, flowId)
      return [
        { flowId, eventsList: flowEvents, eventIds: flowEvents.map((event) => event.id) },
      ]
    } else {
      return await parseQuery(query, flows)
    }
  }, [])

  return { getFlowsToRun }
}
