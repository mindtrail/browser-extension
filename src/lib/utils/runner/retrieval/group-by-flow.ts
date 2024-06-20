export function groupByFlowAndQuery(queries) {
  const grouped = queries.reduce((acc, current) => {
    const flowEntry = acc.find((entry) => entry.flowId === current.flowId)
    if (flowEntry) {
      const queryEntry = flowEntry.queries.find((q) => q.query === current.query)
      if (queryEntry) {
        queryEntry.eventIds = [...new Set([...queryEntry.eventIds, ...current.eventIds])]
      } else {
        flowEntry.queries.push({ query: current.query, eventIds: current.eventIds })
      }
    } else {
      acc.push({
        flowId: current.flowId,
        queries: [{ query: current.query, eventIds: current.eventIds }],
      })
    }
    return acc
  }, [])

  // Flatten the structure to [{flowId: string, eventIds: [string]}]
  return grouped.map((flow) => ({
    flowId: flow.flowId,
    eventIds: flow.queries.reduce((allIds, query) => [...allIds, ...query.eventIds], []),
  }))
}
