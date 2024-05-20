export function buildParamsSchema(events) {
  const schema = {}

  function processEvents(events) {
    events.forEach((event) => {
      if (event.type === 'input' && event.name) {
        const type = event.targetType === 'number' ? event.targetType : 'string'
        schema[event.name] = type
      }
      if (event.events) {
        processEvents(event.events)
      }
    })
  }

  processEvents(events)
  return schema
}
