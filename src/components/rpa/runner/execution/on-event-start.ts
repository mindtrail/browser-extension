import { updateTask, getTask } from '~/lib/supabase'

export async function onEventStart(flowId, event, taskId) {
  const taskRes = await getTask(taskId)
  const task: any = taskRes.data

  // Check if the eventId already exists in the logs
  const eventExists = task.logs.some((log) => log.eventId === event.id)

  // Only add the log if the eventId does not exist
  if (!eventExists) {
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
          status: 'running',
        },
      ],
    })
  }
}
