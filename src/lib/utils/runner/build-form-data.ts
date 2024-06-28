import { updateFormData } from '~lib/llm/openai'

export async function buildFormData({ variables, events }) {
  const form = events
    .filter((event) => event.type === 'input')
    .reduce((acc, event) => {
      acc[event.event_name] = event.value
      return acc
    }, {})

  const data = await updateFormData({ form, variables })

  return data
}
