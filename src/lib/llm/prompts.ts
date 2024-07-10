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

export const extractListEntitiesPrompt = ({ html }) => [
  {
    role: 'system',
    content: `
    Output Requirement: Only respond with JSON array format and absolute no explanation. ONLY ARRAY !
    Output: Response should always be a JSON array in this format: [{}, {}, etc.]. Always ARRAY !
    `,
  },
  {
    role: 'user',
    content: `Export this html into a structured data JSON array: ${html}. Always return an array !`,
  },
]

export const generateMetadataPrompt = (query) => [
  {
    role: 'system',
    content: `Role: You are a tool that outputs as JSON the name and description of a flow used in a RPA tool.
        Tasks: You will generate name and description for the flow in general and for each event.
        Output Requirements: Only respond with JSON format and absolutely no explanation.
        Output: Response should always be a JSON object in this format: {name: string, description: string, events: [{event_name: string, event_description: string}]}`,
  },
  {
    role: 'user',
    content: JSON.stringify(query),
  },
]

export const generateEventsPrompt = ({ events, actionsStore }) => [
  {
    role: 'system',
    content: `Role: You are a tool that updates selectors from withing a given JSON array of events.
        Tasks: You will update selectors (only update selectors!) from the given "RPA_flow" using a list of "Possible Actions" that contains alternative selector paterns.
        Output: Response should always be a just a JSON array !`,
  },
  {
    role: 'user',
    content: [
      {
        type: 'text',
        text: `
        "RPA_flow": ${JSON.stringify(events)}
        `,
      },
      {
        type: 'text',
        text: `
        "Possible Actions": ${JSON.stringify(actionsStore)}
        `,
      },
    ],
  },
]

export const generateActionsPrompt = (html, selectors) => [
  {
    role: 'assistant',
    content: [
      {
        type: 'text',
        text: `
          [
            {
              "type": "input",
              "label": "The closest and most relevant description of the input field",
              "selector": "The CSS selector (ex: '[data-test-key='name'] input[type='text']')"
            },
            {
              "type": "click",
              "label": "The closest and most relevant description of the button or link",
              "selector": "The CSS selector (ex: '[data-test-key='name'] button[type='submit']')"
            }
          ]
        `,
      },
      {
        type: 'text',
        text: `Use the above action types + example selectors to extract all meaningful and relevant actions from the given HTML.
        1. Group actions by sections (ex: forms, navigation, etc.) 
        2. Add a description for each section.
        3. Filter out actions with a description that doesn't make sense or is to generic.
        4. Use JSON format`,
      },
    ],
  },
  {
    role: 'user',
    content: [
      {
        type: 'text',
        text: html,
      },
      {
        type: 'text',
        text: `Example selectors: ${JSON.stringify(selectors)}`,
      },
    ],
  },
]

export const updateFormDataPrompt = ({ form, variables }) => [
  {
    role: 'system',
    content: `You are a tool that updates the values of a form object based on the given JSON database of available information extracted from various sources.`,
  },
  {
    role: 'user',
    content: `
      1. The following JSON represents a database of available information extracted from various sources. Some might be useful other might not. 
      The role of it is to be used as a source of truth for when we need to auto-fill some fields or params.  
      ${JSON.stringify(variables)}
    `,
  },
  {
    role: 'user',
    content: `
      2. Next this other JSON structure represents a form object. The value needs to be updated, where it makes sense, with relevant information extracted from the database above.
      Allow a bit of flexibility if information is not exact but could be relevant or infered (ex: if form data requires work phone but you only have a personal phone then use that) but if you can't find relevant information for a form fields then remove that fields from the form object !
      Old values should not be used !
      ${JSON.stringify(form)}
    `,
  },
]
