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
  searchPrompt,
  extractPropertiesPrompt,
  splitNQLPrompt,
} from './prompts'

export async function splitQuery(query) {
  const completion = await groq.chat.completions.create({
    messages: splitQueryPrompt(query),
    model: 'mixtral-8x7b-32768',
    temperature: 0.1,
  })
  return JSON.parse(completion.choices[0].message.content)
}

export async function splitNQL(query) {
  const completion = await groq.chat.completions.create({
    messages: splitNQLPrompt(query),
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

export async function extractParams({ query, schema, entities }) {
  if (!query) return {}
  const completion = await groq.chat.completions.create({
    messages: extractParamsPrompt({ query, schema, entities }),
    model: 'mixtral-8x7b-32768',
    // model: 'llama3-70b-8192',
    temperature: 0.1,
  })
  const result = completion.choices[0].message.content
  console.log('extractParams', result)
  return JSON.parse(result)
}

export async function search({ query, entities }) {
  if (!query) return []
  const completion = await groq.chat.completions.create({
    messages: searchPrompt({ query, entities }),
    model: 'llama3-70b-8192',
    temperature: 0.1,
  })
  return JSON.parse(completion.choices[0].message.content).map((index) => entities[index])
}

export async function extractProperties({ entities }) {
  if (!entities) return []
  const completion = await groq.chat.completions.create({
    messages: extractPropertiesPrompt({ entities }),
    model: 'llama3-70b-8192',
    temperature: 0.1,
  })
  const result = completion.choices[0].message.content
  console.log('extractProperties', result)
  return JSON.parse(result)
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
