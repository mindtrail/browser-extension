export function groupByFlow(queries) {
  return queries.reduce((acc, current) => {
    const last = acc[acc.length - 1]
    if (last && last.flowId === current.flowId) {
      if (!Array.isArray(last.queries)) {
        last.queries = []
      }
      last.queries.push(current.query)
      return acc
    } else {
      return [...acc, { flowId: current.flowId, queries: [current.query] }]
    }
  }, [])
}
