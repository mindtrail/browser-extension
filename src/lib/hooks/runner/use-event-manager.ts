import { useCallback } from 'react'
import { getTask, updateTask } from '~/lib/supabase'

export const useEventManager = () => {
  const handleEventStart = useCallback(async ({ flowId, event, taskId }) => {
    const taskRes = await getTask(taskId)
    const task = taskRes.data

    const eventExists = task.logs.some((log) => log.eventId === event.id)
    if (!eventExists) {
      await updateTask(task.id, {
        ...task,
        state: { ...task.state, status: 'running' },
        logs: [...task.logs, { flowId, eventId: event.id, status: 'running' }],
      })
    }
  }, [])

  const handleEventEnd = useCallback(async ({ event, taskId, setRunnerState }) => {
    const taskRes = await getTask(taskId)
    const task = taskRes.data
    await updateTask(task.id, {
      ...task,
      state: { ...task.state, status: 'running' },
      logs: task.logs.map((log) =>
        log.eventId === event.id ? { ...log, status: 'ended' } : log,
      ),
    })

    setRunnerState((prev) => {
      const eventAlreadyRan = prev.eventsCompleted.some((e) => e.id === event.id)
      if (eventAlreadyRan) return prev
      return {
        ...prev,
        eventsCompleted: [...prev.eventsCompleted, event],
      }
    })
  }, [])

  return { handleEventStart, handleEventEnd }
}
