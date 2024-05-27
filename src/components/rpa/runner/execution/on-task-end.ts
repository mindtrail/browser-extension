import { getTask, updateTask } from '~/lib/supabase'

export async function onTaskEnd(flowId, taskId) {
  const taskRes = await getTask(taskId)
  const task: any = taskRes.data

  // Update task state to 'ended' if all events are ended
  const logs = task.logs || []
  const lastLog = logs[logs.length - 1]
  if (lastLog && lastLog.status === 'ended') {
    return updateTask(task.id, {
      ...task,
      state: {
        ...task.state,
        status: 'ended',
      },
    })
  }

  return task
}
