export function buildParamsSchema(events) {
  const inputData = {}
  events.forEach((event) => {
    if (event.type === 'input' && event.name) {
      inputData[event.name] = ''
    }
  })
  return inputData
}
