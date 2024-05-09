export function buildParamsSchema(events) {
  const schema = {}
  events.forEach((event) => {
    if (event.type === 'input' && event.name) {
      const type = event.targetType === 'number' ? event.targetType : 'string'
      schema[event.name] = type
    }
  })
  return schema
}
