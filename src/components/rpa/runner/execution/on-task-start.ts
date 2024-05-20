import { createTask } from '../../utils/supabase'

export async function onTaskStart(flowId) {
  const newTaskRes = await createTask({
    state: {
      status: 'started',
    },
    logs: [
      {
        flowId,
        status: 'started',
      },
    ],
  })
  return newTaskRes.data
}
