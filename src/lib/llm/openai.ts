import OpenAI from 'openai'

import {
  splitQueryPrompt,
  detectFlowPrompt,
  extractParamsPrompt,
  generateMetadataPrompt,
  searchPrompt,
  extractPropertiesPrompt,
  splitNQLPrompt,
  extractListEntitiesPrompt,
} from './prompts'

const openai = new OpenAI({
  apiKey: process.env.PLASMO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
})

export async function splitQuery(query) {
  try {
    console.log('splitQuery', query)
    const completion = await openai.chat.completions.create({
      messages: splitQueryPrompt(
        query,
      ) as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      model: 'gpt-4o',
      temperature: 0.1,
      response_format: { type: 'json_object' },
    })
    return JSON.parse(completion.choices[0].message.content)
  } catch (error) {
    console.log(error)
  }
}

export async function splitNQL(query) {
  try {
    const completion = await openai.chat.completions.create({
      messages: splitNQLPrompt(
        query,
      ) as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      model: 'gpt-4o',
      temperature: 0.1,
      response_format: { type: 'json_object' },
    })
    return JSON.parse(completion.choices[0].message.content)
  } catch (error) {
    console.log(error)
  }
}

export async function detectFlow(queries, flows) {
  const completion = await openai.chat.completions.create({
    messages: detectFlowPrompt(
      queries,
      flows,
    ) as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    model: 'gpt-4o',
    temperature: 0.1,
    response_format: { type: 'json_object' },
  })
  return JSON.parse(completion.choices[0].message.content)
}

export async function extractParams({ query, schema, entities }) {
  if (!query) return {}
  const completion = await openai.chat.completions.create({
    messages: extractParamsPrompt({
      query,
      schema,
      entities,
    }) as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    model: 'gpt-4o',
    temperature: 0.1,
    // response_format: { type: 'json_object' },
  })
  const result = completion.choices[0].message.content
  console.log('extractParams', result)
  return JSON.parse(result)
}

export async function search({ query, entities }) {
  if (!query) return []
  const completion = await openai.chat.completions.create({
    messages: searchPrompt({
      query,
      entities,
    }) as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    model: 'gpt-4o',
    temperature: 0.1,
  })
  const result = JSON.parse(completion.choices[0].message.content)
  console.log('search', result)
  if (Array.isArray(result)) {
    return result.map((index) => entities[index])
  }
  return []
}

export async function extractProperties({ entities }) {
  if (!entities) return []
  const completion = await openai.chat.completions.create({
    messages: extractPropertiesPrompt({
      entities,
    }) as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    model: 'gpt-4o',
    temperature: 0.1,
    response_format: { type: 'json_object' },
  })
  const result = completion.choices[0].message.content
  console.log('extractProperties', result)
  return JSON.parse(result)
}

export async function extractListEntities({ html }) {
  if (!html) return []
  const completion = await openai.chat.completions.create({
    messages: extractListEntitiesPrompt({
      html,
    }) as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    model: 'gpt-4o',
    temperature: 0.1,
    // response_format: { type: 'json_object' },
  })
  const result = completion.choices[0].message.content
  console.log('extractProperties', result)
  return JSON.parse(result)
}

export async function generateMetadata(query) {
  const completion = await openai.chat.completions.create({
    messages: generateMetadataPrompt(
      query,
    ) as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    model: 'gpt-4o',
    temperature: 0.1,
    response_format: { type: 'json_object' },
  })
  const result = completion.choices[0].message.content
  console.log('generateMetadata', typeof result, result)
  return JSON.parse(result)
}
