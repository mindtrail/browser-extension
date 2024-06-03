import { getFlowEvents } from '~lib/utils/runner/get-flow-events'
import { runEvents } from './run-events'
import { processQuery } from './process-query'

export async function runFlows({
  task,
  flows,
  flowsToRun,
  query,
  onEventStart,
  onEventEnd,
}) {
  for (const { flowId, eventIds } of flowsToRun) {
    const events = getFlowEvents(flows, flowId).filter((event) =>
      eventIds.includes(event.id),
    )
    events.sort((a, b) => eventIds.indexOf(a.id) - eventIds.indexOf(b.id))
    if (query) {
      await processQuery({
        task,
        flowId,
        events,
        query,
        onEventStart,
        onEventEnd,
      })
    } else {
      await runEvents({
        task,
        flowId,
        events,
        data: {},
        onEventStart,
        onEventEnd,
      })
    }
  }
}
