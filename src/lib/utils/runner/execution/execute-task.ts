import { runEvents } from './run-events'
import { buildFormData } from '~lib/utils/runner/build-form-data'

export async function executeTask(props: ExecuteTaskProp) {
  const { task, flowToRun, query, onEventStart, onEventEnd } = props
  const { flowId, eventIds, events } = flowToRun || {}

  // @TODO: Clarify the use case where this filtering was needed
  // const events = getFlowEvents(flows, flowId).filter((event) =>
  //   eventIds.includes(event.id),
  // )

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