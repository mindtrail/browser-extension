import Groq from 'groq-sdk'
const groq = new Groq({
  apiKey: process.env.PLASMO_PUBLIC_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
})

export async function splitQuery(query) {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `
        Role: You are a tool that receives a user query. 
        Task: Split the query into smallest possible parts but with whole meaning. Example: "Go to products and change name to Alin" should be split into "Go to products" and "Change name to Alin"
        Transformation: Rewrite each query so that it makes sense independently. Example: ['Go to categories', 'Then to products'] should be transformed into ['Go to categories', 'Go to products']
        Output Requirement: Only respond with JSON format and absolute no explanation.
        Output: Response should always be a JSON array of strings in this format: ['query 1', 'query 2', etc.]
        `,
      },
      { role: 'user', content: query },
    ],
    model: 'mixtral-8x7b-32768',
  })
  return JSON.parse(completion.choices[0].message.content)
}

export async function detectFlow(queries, flows) {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `
        Role: You are a tool that detects the intended flow from a query. 
        Task: For each query in this array of queries detect the flow with most similarity based on the query.
        Output Requirement: Only respond with JSON format and absolute no explanation.
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
    model: 'mixtral-8x7b-32768',
  })
  return JSON.parse(completion.choices[0].message.content)
}

export async function extractParams(query, schema) {
  if (!query) return {}
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content:
          'You are a tool that outputs as JSON the properties extracted from a query to be used in a RPA tool to fill the input fields.',
      },
      { role: 'user', content: `${query} in this format: ${JSON.stringify(schema)}` },
    ],
    model: 'mixtral-8x7b-32768',
  })
  return JSON.parse(completion.choices[0].message.content)
}

export async function generateFlowName(query) {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content:
          'You are a tool that outputs as JSON the name and description of a flow used in a RPA tool. You will generate a name and description based on the events in the flow.',
      },
      { role: 'user', content: query },
    ],
    model: 'mixtral-8x7b-32768',
  })
  return JSON.parse(completion.choices[0].message.content)
}
