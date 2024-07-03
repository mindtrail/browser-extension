import { parseQuery } from './parse-query'
import { getFlowEvents } from '~lib/utils/runner/get-flow-events'

export async function getFlowsToRun({ flows, flowId, query }: FlowsRetrieval) {
  if (!flowId) {
    return await parseQuery(query, flows)
  }

  const flowEvents = getFlowEvents(flows, flowId)
  return [
    { flowId, eventsList: flowEvents, eventIds: flowEvents.map((event) => event.id) },
  ]
}
