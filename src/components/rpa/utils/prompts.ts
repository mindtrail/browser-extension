export const splitQueryPrompt = (query) => [
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
]

export const splitNQLPrompt = (query) => [
  {
    role: 'system',
    content: `
        Role: You are a tool that receives a user query in a custom format (hybrid between SQL and Natural Language = NQL).
        Task: Split the query and assign each subquery to a category based on NQL syntax: SELECT, UPDATE|CREATE|DELETE.
        Output Requirement: Only respond with JSON format and absolute no explanation.
        Output: Response should always be a JSON array in this format: [{
          SELECT: [string, string, etc.],
          UPDATE: [string, string, etc.],
          CREATE: [string, string, etc.],
          DELETE: [string, string, etc.]
        }]
        `,
  },
  { role: 'user', content: query },
]

export const detectFlowPrompt = (queries, flows) => [
  {
    role: 'system',
    content: `
        Role: You are a tool that detects the intended flow from a query.
        Task: For each query in this array of queries detect the flow and the eventIds with most similarity based on the query.
        Output Requirement: Only respond with JSON format and absolute no explanation.
        Output: Response should always be a JSON array in this format: [{query: string, flowId: string, eventIds: [string]}]`,
  },
  {
    role: 'user',
    content: `
        For each query in this array of queries <queries>${JSON.stringify(
          queries,
        )}</queries>, detect the related flow and the eventIds from this array of flows: <flows>${JSON.stringify(
          flows,
        )}</flows>`,
  },
]

export const extractParamsPrompt = ({ query, schema, entities }) => [
  {
    role: 'system',
    content: `You are a tool that outputs as JSON the properties extracted from a query to be used in a RPA tool to fill the input fields. Always respond in this JSON array format: [${JSON.stringify(
      schema,
    )}]
      Output Requirement: Only respond with JSON array format and absolute no explanation. If there is no data to extract generate data based on query and entities: ${JSON.stringify(
        entities,
      )}
      Output: Response should always be a JSON array object in this format: [{property1: value1, property2: value2, etc.}]
    `,
  },
  { role: 'user', content: `${query} in this format: [${JSON.stringify(schema)}]` },
]

export const searchPrompt = ({ query, entities }) => [
  {
    role: 'system',
    content: `You are a tool that filters an array based on the given query.
      Output Requirement: Only respond with JSON array format and absolute no explanation. Array should contain indexes of the entities that match the query.
      Output: Response should always be a JSON array in this format: [index, index, etc.]
    `,
  },
  {
    role: 'user',
    content: `Filter this array: ${JSON.stringify(
      entities,
    )} based on this query: ${query}`,
  },
]

export const extractPropertiesPrompt = ({ entities }) => [
  {
    role: 'system',
    content: `You are a tool that generates relevant, generic (not specific to any entity) property keys based on the given JSON array. The keys will be used for extracting data from the JSON array. If no better alternative then default key name should be: "name".
      Output Requirement: Only respond with JSON array of strings and absolute no explanation. Array should contain relevant, generic (not specific to any entity), generated key names as replacements only for this pattern: "__unknown_property_<propertyIndex>__". Skip those keys that don't have this pattern: "__unknown_property_<propertyIndex>__".
      Output: Response should always be a JSON array in this format: ["string", "string", etc.]
    `,
  },
  {
    role: 'user',
    content: `Generate relevant, generic (not specific to any entity) property keys for this JSON array: ${JSON.stringify(
      entities,
    )}`,
  },
]

export const generateMetadataPrompt = (query) => [
  {
    role: 'system',
    content: `Role: You are a tool that outputs as JSON the name and description of a flow used in a RPA tool.
        Tasks:
          1. You will generate name and description:
              1.1 for the flow in general
              1.2 for each event
          2. Pay close atention to the baseURI and corelate it with the rest of the event properties to generate a meaningful name and description.
        Output Requirements:
          1. Only respond with JSON format and absolutely no explanation.
          2. Pay attention to baseURI when it comes to the infering the type of action: create vs update. Details from baseURI could lead to what action is being performed. Example: item/<id> means UPDATE of item with id <id> not CREATE !
          3. If selector is part of a navigation section OR if the baseURI is changing as an effect of the event then use words as "NAV to <variable>" as the name.
        Output: Response should always be a JSON object in this format: {name: string, description: string, events: [{event_name: string, event_description: string}]}`,
  },
  { role: 'user', content: JSON.stringify(query) },
]
