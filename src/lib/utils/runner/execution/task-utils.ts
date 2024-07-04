import { createTask, getTask, updateTask, getLastThread } from '~/lib/supabase'

export async function createNewTask(flowId: string) {
  if (!flowId) {
    throw new Error('Flow ID is required')
  }

  const thread = await getLastThread()
  const newTaskRes = await createTask({
    state: {
      status: 'started',
      flowId,
      retries: 0,
      variables: thread.data,
    },
    logs: [],
  })
  return newTaskRes.data
}

export async function endTask(task: any, status: 'ended' | 'failed' = 'ended') {
  return updateTask(task.id, {
    ...task,
    state: {
      ...task.state,
      status,
    },
  })
}

export async function markTaskRetry(task: any) {
  return updateTask(task.id, {
    ...task,
    state: {
      ...task.state,
      retries: (task?.state?.retries || 0) + 1,
    },
  })
}

export async function handleEventStart({ flowId, event, taskId }: OnEventStartProps) {
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

export async function handleEventEnd({ event, taskId }: OnEventEndProps) {
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
