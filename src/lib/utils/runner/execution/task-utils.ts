import { createTask, getTask, updateTask, getLastThread } from '~/lib/supabase'

export async function onTaskStart(flowId: string) {
  const thread = await getLastThread()
  const newTaskRes = await createTask({
    state: {
      status: 'started',
      variables: thread.data,
      flowId,
    },
    logs: [],
  })
  return newTaskRes.data
}

export async function onTaskEnd(taskId: string) {
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

export async function onEventStart({ flowId, event, taskId }: OnEventStartProps) {
  const taskRes = await getTask(taskId)
  const task = taskRes.data

  // Check if the eventId already exists in the logs
  const eventExists = task.logs.some((log) => log.eventId === event.id)
  if (!eventExists) {
    await updateTask(task.id, {
      ...task,
      state: { ...task.state, status: 'running' },
      logs: [...task.logs, { flowId, eventId: event.id, status: 'running' }],
    })
  }
}

export async function onEventEnd({ event, taskId }: OnEventEndProps) {
  const taskRes = await getTask(taskId)
  const task = taskRes.data

  await updateTask(task.id, {
    ...task,
    state: { ...task.state, status: 'running' },
    logs: task.logs.map((log) =>
      log.eventId === event.id ? { ...log, status: 'ended' } : log,
    ),
  })
}
