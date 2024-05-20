import { updateTask, getTask } from '../../utils/supabase'

export async function onEventStart(flowId, event, taskId) {
  const taskRes = await getTask(taskId)
  const task: any = taskRes.data
  await updateTask(task.id, {
    ...task,
    state: {
      ...task.state,
      status: 'running',
    },
    logs: [
      ...task.logs,
      {
        flowId,
        eventId: event.id,
        status: `${event.id}(start)`, // format for testing purpose
      },
    ],
  })
}
