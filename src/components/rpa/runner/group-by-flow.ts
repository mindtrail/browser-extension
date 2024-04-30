/**
 * Groups queries by their flowId into a single array.
 * Each element in the resulting array is an object containing a flowId and an array of associated queries.
 * If multiple queries share the same flowId, they are grouped together under the same object.
 *
 * @param {Array} queries - Array of query objects, each containing a flowId and a query.
 * @returns {Array} An array of objects, each containing a unique flowId and an array of queries associated with that flowId.
 */
export function groupByFlow(queries) {
  return queries.reduce((acc, current) => {
    const last = acc[acc.length - 1]
    if (last && last.flowId === current.flowId) {
      if (!Array.isArray(last.queries)) {
        last.queries = []
      }
      if (!Array.isArray(last.eventIds)) {
        last.eventIds = []
      }
      last.queries.push(current.query)
      last.eventIds = [...last.eventIds, ...current.eventIds]
      return acc
    } else {
      return [
        ...acc,
        { flowId: current.flowId, queries: [current.query], eventIds: current.eventIds },
      ]
    }
  }, [])
}
