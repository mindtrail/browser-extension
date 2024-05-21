import { createTask } from '~/lib/supabase'

export async function onTaskStart(flowId) {
  const newTaskRes = await createTask({
    state: {
      status: 'started',
      variables: {},
      flowId,
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
