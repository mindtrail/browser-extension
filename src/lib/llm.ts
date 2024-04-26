import OpenAI from 'openai'
const openai = new OpenAI({
  apiKey: process.env.PLASMO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
})

export async function llm(query) {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content:
          'You are a tool that outputs as JSON the properties extracted from a query to be used in a RPA tool to fill the input fields.',
      },
      { role: 'user', content: query },
    ],
    model: 'gpt-3.5-turbo-0125',
    response_format: { type: 'json_object' },
  })
  return JSON.parse(completion.choices[0].message.content)
}
