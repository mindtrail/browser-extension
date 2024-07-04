import { runEvents } from './run-events'
import { buildFormData } from '~lib/utils/runner/build-form-data'

export async function executeTask(props: ExecuteTaskProp) {
  const { task, flow, query, onEventStart, onEventEnd } = props
  const { id, eventIds, events = [] } = flow || {}

  // @TODO: Clarify the use case where this filtering was needed
  // const events = getFlowEvents(flows, id).filter((event) =>
  //   eventIds.includes(event.id),
  // )

  events?.sort((a, b) => eventIds.indexOf(a.id) - eventIds.indexOf(b.id))
  const data = await buildFormData({ variables: task.state.variables, events })

  await runEvents({
    task,
    flowId: id,
    events,
    data,
    onEventStart,
    onEventEnd,
  })
}
