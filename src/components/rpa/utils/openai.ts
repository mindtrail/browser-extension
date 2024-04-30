import OpenAI from 'openai'
const openai = new OpenAI({
  apiKey: process.env.PLASMO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
})
import {
  splitQueryPrompt,
  detectFlowPrompt,
  extractParamsPrompt,
  generateFlowNamePrompt,
} from './prompts'

export async function splitQuery(query) {
  try {
    const completion = await openai.chat.completions.create({
      messages: splitQueryPrompt(
        query,
      ) as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      model: 'gpt-3.5-turbo-0125',
      response_format: { type: 'json_object' },
      temperature: 0.1,
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
    model: 'gpt-3.5-turbo-0125',
    response_format: { type: 'json_object' },
    temperature: 0.1,
  })
  return JSON.parse(completion.choices[0].message.content)
}

export async function extractParams(query, schema) {
  if (!query) return {}
  const completion = await openai.chat.completions.create({
    messages: extractParamsPrompt(
      query,
      schema,
    ) as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    model: 'gpt-3.5-turbo-0125',
    response_format: { type: 'json_object' },
  })
  return JSON.parse(completion.choices[0].message.content)
}

export async function generateFlowName(query) {
  const completion = await openai.chat.completions.create({
    messages: generateFlowNamePrompt(
      query,
    ) as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    model: 'gpt-4',
  })
  return JSON.parse(completion.choices[0].message.content)
}
