import OpenAI from 'openai'
const openai = new OpenAI({
  apiKey: process.env.PLASMO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
})

export async function splitQuery(query) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `
        Role: You are a tool that receives a user query. 
        Task: Split the query into smallest possible parts but with whole meaning. Example: "Go to products and change name to Alin" should be split into "Go to products" and "Change name to Alin"
        Output: Response should always be a JSON array of strings in this format: ['query 1', 'query 2', etc.]`,
        },
        { role: 'user', content: query },
      ],
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
    messages: [
      {
        role: 'system',
        content: `
        Role: You are a tool that detects the intended flow from a query. 
        Task: For each query in this array of queries detect the flow with most similarity based on the query.
        Output: Response should always be a JSON array in this format: [{query: string, flowId: string}]`,
      },
      {
        role: 'user',
        content: `
        For each query in this array of queries <queries>${JSON.stringify(
          queries,
        )}</queries>, detect the related flow from this array of flows: <flows>${JSON.stringify(
          flows,
        )}</flows>`,
      },
    ],
    model: 'gpt-3.5-turbo-0125',
    response_format: { type: 'json_object' },
    temperature: 0.1,
  })
  return JSON.parse(completion.choices[0].message.content)
}

export async function extractParams(query, schema) {
  if (!query) return {}
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content:
          'You are a tool that outputs as JSON the properties extracted from a query to be used in a RPA tool to fill the input fields.',
      },
      {
        role: 'user',
        content: `${query} in this format: ${JSON.stringify(schema)}`,
      },
    ],
    model: 'gpt-3.5-turbo-0125',
    response_format: { type: 'json_object' },
  })
  return JSON.parse(completion.choices[0].message.content)
}

export async function generateFlowName(query) {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content:
          'You are a tool that outputs as JSON the name and description of a flow used in a RPA tool. You will generate a name and description based on the events in the flow.',
      },
      { role: 'user', content: query },
    ],
    model: 'gpt-3.5-turbo-0125',
    response_format: { type: 'json_object' },
  })
  return JSON.parse(completion.choices[0].message.content)
}
