import Groq from 'groq-sdk'
const groq = new Groq({
  apiKey: process.env.PLASMO_PUBLIC_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
})
import {
  splitQueryPrompt,
  detectFlowPrompt,
  extractParamsPrompt,
  generateMetadataPrompt,
} from './prompts'

export async function splitQuery(query) {
  const completion = await groq.chat.completions.create({
    messages: splitQueryPrompt(query),
    model: 'mixtral-8x7b-32768',
    temperature: 0.1,
  })
  return JSON.parse(completion.choices[0].message.content)
}

export async function detectFlow(queries, flows) {
  const completion = await groq.chat.completions.create({
    messages: detectFlowPrompt(queries, flows),
    model: 'mixtral-8x7b-32768',
    temperature: 0.1,
  })
  return JSON.parse(completion.choices[0].message.content)
}

export async function extractParams(query, schema) {
  if (!query) return {}
  const completion = await groq.chat.completions.create({
    messages: extractParamsPrompt(query, schema),
    model: 'mixtral-8x7b-32768',
    // model: 'llama3-70b-8192',
    temperature: 0.1,
  })
  return JSON.parse(completion.choices[0].message.content)
}

export async function generateMetadata(query) {
  const completion = await groq.chat.completions.create({
    messages: generateMetadataPrompt(query),
    model: 'mixtral-8x7b-32768',
    // model: 'llama3-70b-8192',
    temperature: 0.1,
  })
  return JSON.parse(completion.choices[0].message.content)
}
