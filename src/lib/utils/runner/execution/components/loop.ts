import { getTask } from '~/lib/supabase'

export async function loopComponent(props: RunnerComponentProps) {
  const { task, flowId, event, data, onEventStart, onEventEnd, runEvents } = props

  const taskRes = await getTask(task.id)
  const newTask = taskRes.data

  while (newTask.state.variables[event.loopItems].length > 0) {
    const item = newTask.state.variables[event.loopItems].shift()
    data.name = item.name || data.name

    await runEvents({
      task: newTask,
      flowId,
      events: event.events,
      data,
      onEventStart,
      onEventEnd,
    })
  }
}
