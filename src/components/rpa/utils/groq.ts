import Groq from 'groq-sdk'
const groq = new Groq({
  apiKey: process.env.PLASMO_PUBLIC_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
})
import {
  splitQueryPrompt,
  detectFlowPrompt,
  extractParamsPrompt,
  generateFlowNamePrompt,
} from './prompts'

export async function splitQuery(query) {
  const completion = await groq.chat.completions.create({
    messages: splitQueryPrompt(query),
    model: 'mixtral-8x7b-32768',
  })
  return JSON.parse(completion.choices[0].message.content)
}

export async function detectFlow(queries, flows) {
  const completion = await groq.chat.completions.create({
    messages: detectFlowPrompt(queries, flows),
    model: 'mixtral-8x7b-32768',
  })
  return JSON.parse(completion.choices[0].message.content)
}

export async function extractParams(query, schema) {
  if (!query) return {}
  const completion = await groq.chat.completions.create({
    messages: extractParamsPrompt(query, schema),
    model: 'mixtral-8x7b-32768',
  })
  return JSON.parse(completion.choices[0].message.content)
}

export async function generateFlowName(query) {
  const completion = await groq.chat.completions.create({
    messages: generateFlowNamePrompt(query),
    model: 'mixtral-8x7b-32768',
  })
  return JSON.parse(completion.choices[0].message.content)
}
