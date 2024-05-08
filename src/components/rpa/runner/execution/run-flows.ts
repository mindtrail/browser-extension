import { getFlowEvents } from '../../utils/get-flow-events'
import { extractParams } from '../../utils/groq'
import { buildParamsSchema } from './build-params-schema'
import { runEvents } from './run-events'

export async function runFlows({ flows, flowsToRun, query, onEvent }) {
  for (const { flowId, eventIds } of flowsToRun) {
    const events = getFlowEvents(flows, flowId).filter((event) =>
      eventIds.includes(event.id),
    )

    events.sort((a, b) => eventIds.indexOf(a.id) - eventIds.indexOf(b.id))

    const data = await extractParams(query, buildParamsSchema(events))
    await runEvents({
      flowId,
      events,
      data,
      onEvent,
    })
  }
}
