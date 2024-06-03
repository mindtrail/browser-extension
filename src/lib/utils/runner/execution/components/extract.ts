import { buildParamsSchema } from '../build-params-schema'
import { extractTableEntities } from '../extract-entities'
import { updateTask, getTask } from '~/lib/supabase'

export async function extractComponent({ task, events, columns }) {
  const schema = buildParamsSchema(events)
  const entities = await extractTableEntities({
    columns: columns || Object.keys(schema),
    entitySelectorPattern: events[0].selector || '',
  })

  const taskRes = await getTask(task.id)
  task = taskRes.data
  await updateTask(task.id, {
    ...task,
    state: {
      ...task.state,
      variables: {
        ...task.variables,
        entities,
      },
    },
  })
}
