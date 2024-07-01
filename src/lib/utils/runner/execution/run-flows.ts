import { getFlowEvents } from '~lib/utils/runner/get-flow-events'
import { runEvents } from './run-events'
import { buildFormData } from '~lib/utils/runner/build-form-data'

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

    const data = await buildFormData({ variables: task.state.variables, events })

    await runEvents({
      task,
      flowId,
      events,
      data,
      onEventStart,
      onEventEnd,
    })
  }
}
