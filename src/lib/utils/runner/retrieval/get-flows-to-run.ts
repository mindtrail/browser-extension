import { parseQuery } from './parse-query'
import { getFlowEvents } from '~lib/utils/runner/get-flow-events'

export async function getFlowsToRun({ flows, flowId, query }) {
  return flowId
    ? [{ flowId, eventIds: getFlowEvents(flows, flowId).map((event) => event.id) }]
    : await parseQuery(query, flows)
}
