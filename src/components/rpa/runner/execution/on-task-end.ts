import { getTask, updateTask } from '../../utils/supabase'

export async function onTaskEnd(flowId, taskId) {
  const taskRes = await getTask(taskId)
  const task: any = taskRes.data
  return updateTask(task.id, {
    ...task,
    state: {
      ...task.state,
      status: 'ended',
    },
    logs: [
      ...task.logs,
      {
        flowId,
        status: 'ended',
      },
    ],
  })
}
