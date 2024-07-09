import { createTask, getTask, updateTask, getLastThread } from '~/lib/supabase'
import { TASK_STATUS } from '~/lib/constants'

export async function createNewTask(flowId: string) {
  if (!flowId) {
    throw new Error('Flow ID is required')
  }

  const thread = await getLastThread()
  const newTaskRes = await createTask({
    state: {
      status: 'started',
      flowId,
      variables: thread?.data || [],
    },
    logs: [],
  })
  return newTaskRes.data
}

export async function endTask(task: any, status: TASK_STATUS = TASK_STATUS.COMPLETED) {
  if (!task) return

  const taskRes = await getTask(task.id)
  const updatedTask = taskRes.data
  const payload = { ...updatedTask, state: { ...updatedTask.state, status } }

  return updateTask(updatedTask.id, payload)
}

export async function markTaskRetry(task: any, retries: number = 0) {
  console.log(retries)
  return updateTask(task.id, {
    ...task,
    state: {
      ...task.state,
      retries,
    },
  })
}

export async function handleEventStart({ flowId, event, taskId }: OnEventStartProps) {
  const result = await getTask(taskId)
  const task = result.data
  if (!task) return

  // We skip events already running. Events ended are skipped from run-events
  const eventExists = task?.logs?.some((log) => log.eventId === event.id)
  if (!eventExists) {
    await updateTask(task.id, {
      ...task,
      state: { ...task.state, status: TASK_STATUS.RUNNING },
      logs: [...task.logs, { flowId, eventId: event.id, status: TASK_STATUS.RUNNING }],
    })
  }
}

export async function handleEventEnd(props: OnEventEndProps) {
  const { event, taskId, status = TASK_STATUS.COMPLETED } = props
  const result = await getTask(taskId)
  const task = result.data
  if (!task) return

  console.log('end', task)

  const updatedTask = {
    ...task,
    logs: task.logs.map((log) => (log.eventId === event.id ? { ...log, status } : log)),
  }

  const updateRes = await updateTask(task.id, updatedTask)

  if (!updateRes.error) {
    return updatedTask
  }
}
