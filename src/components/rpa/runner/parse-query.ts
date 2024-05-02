import { detectFlow, splitQuery } from '../utils/groq'
import { groupByFlowAndQuery } from './group-by-flow'

export async function parseQuery(query, flows) {
  let queries = await splitQuery(query)
  console.log(queries)
  let flowIds = await detectFlow(queries, flows)
  console.log(flowIds)
  flowIds = groupByFlowAndQuery(flowIds)
  console.log(flowIds)
  if (!flowIds || flowIds.length === 0) {
    return
  }
  return flowIds
}

const mock_response = [
  {
    flowId: 'flow1',
    eventIds: ['event1', 'event2'],
  },
  {
    flowId: 'flow2',
    eventIds: ['event2', 'event4'],
  },
]
