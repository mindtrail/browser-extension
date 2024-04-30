import { getFlowEvents } from './get-flow-events'
import { extractParams } from '../utils/openai'
import { buildParamsSchema } from './build-params-schema'
import { runEvents } from './run-events'

export async function runFlows({ flows, flowsToRun, query, onEvent }) {
  for (const { flowId, eventIds } of flowsToRun) {
    const events = getFlowEvents(flows, flowId).filter((event) =>
      eventIds.includes(event.id),
    )
    const data = await extractParams(query, buildParamsSchema(events))
    await runEvents({
      events,
      data,
      onEvent,
    })
  }
}
