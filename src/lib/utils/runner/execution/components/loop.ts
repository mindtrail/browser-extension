import { getTask } from '~/lib/supabase'

export async function loopComponent(props: RunnerComponentProps) {
  const { task, flowId, event, data, onEventStart, onEventEnd, runEvents } = props

  // @TODO: I don't understand this. Isn't is the same the actual task?
  const taskRes = await getTask(task.id)
  const updatedTask = taskRes.data

  while (updatedTask.state.variables[event.loopItems].length > 0) {
    const item = updatedTask.state.variables[event.loopItems].shift()
    data.name = item.name || data.name

    await runEvents({
      task: updatedTask,
      flowId,
      events: event.events,
      data,
      onEventStart,
      onEventEnd,
    })
  }
}
