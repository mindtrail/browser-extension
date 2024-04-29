import { detectFlow, splitQuery } from '../utils/groq'
import { groupByFlow } from './group-by-flow'

export async function parseQuery(query, flows) {
  let queries = await splitQuery(query)
  console.log(queries)
  let flowIds = await detectFlow(queries, flows)
  console.log(flowIds)
  flowIds = groupByFlow(flowIds)
  console.log(flowIds)
  if (!flowIds || flowIds.length === 0) {
    return
  }
  return flowIds
}
