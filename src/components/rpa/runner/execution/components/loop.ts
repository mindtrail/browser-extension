import { getTask } from '../../../utils/supabase'

export async function loopComponent({
  task,
  flowId,
  event,
  data,
  onEventStart,
  onEventEnd,
  runEvents,
}) {
  const taskRes = await getTask(task.id)
  task = taskRes.data
  while (task.state.variables[event.loopItems].length > 0) {
    const item = task.state.variables[event.loopItems].shift()
    if (item.name) data.name = item.name
    await runEvents({
      task,
      flowId,
      events: event.events,
      data,
      onEventStart,
      onEventEnd,
    })
  }
}
