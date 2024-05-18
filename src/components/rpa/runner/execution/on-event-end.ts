import { updateTask, getTask } from '../../utils/supabase'

export async function onEventEnd(flowId, event, taskId) {
  const taskRes = await getTask(taskId)
  const task: any = taskRes.data
  await updateTask(task.id, {
    ...task,
    state: {
      ...task.state,
      status: 'running',
    },
    logs: task.logs.map((log) => {
      if (log.eventId === event.id) {
        console.log('onEventEnd', event.id)
        return {
          ...log,
          status: `${log.status} - ${event.id}(end)`, // format for testing purpose
        }
      }
      return log
    }),
  })
}
