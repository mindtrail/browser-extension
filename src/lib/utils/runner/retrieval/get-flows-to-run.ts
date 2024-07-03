import { parseQuery } from './parse-query'
import { getFlowEvents } from '~lib/utils/runner/get-flow-events'

export async function getFlowsToRun({ flows, flowId, query }) {
  const flowEvents = getFlowEvents(flows, flowId)
  return flowId
    ? [{ flowId, eventIds: flowEvents.map((event) => event.id) }]
    : await parseQuery(query, flows)
}
