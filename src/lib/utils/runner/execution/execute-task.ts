import { runEvents } from './run-events'
import { buildFormData } from '~lib/utils/runner/build-form-data'

export async function executeTask(props: ExecuteTaskProp) {
  const { task, flow, query, onEventStart, onEventEnd } = props
  const { id, events = [] } = flow || {}

  // @TODO: Clarify the use case where this filtering was needed and also why the sorting?
  // const events = getFlowEvents(flows, id).filter((event) =>
  //   eventIds.includes(event.id),
  // )
  // const eventIds = events.map((event: any) => event.id)

  // events?.sort((a, b) => eventIds?.indexOf(a.id) - eventIds.indexOf(b.id))
  const data = await buildFormData({ variables: task.state.variables, events })

  await runEvents({
    flowId: id,
    task,
    events,
    data,
    onEventStart,
    onEventEnd,
  })
}
