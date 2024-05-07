import { detectFlow, splitQuery } from '../../utils/openai'
import { groupByFlowAndQuery } from './group-by-flow'

export async function parseQuery(query, flows) {
  let queries = await splitQuery(query)
  console.log(queries)

  let flowIds = await detectFlow(queries, flows)
  console.log('detectFlow', flowIds)

  flowIds = groupByFlowAndQuery(flowIds)
  console.log('groupByFlowAndQuery', flowIds)

  flowIds = addFlowDependencies(flowIds, flows)
  console.log('addFlowDependencies', flowIds)

  flowIds = flowIds.map((flow) => ({
    ...flow,
    eventIds: [
      ...getFlowStartEventIds(flow.eventIds),
      ...getMiddleEvents(flow.eventIds),
      ...getFlowEndEventIds(flow.eventIds),
    ],
  }))
  console.log('flowIds', flowIds)

  if (!flowIds || flowIds.length === 0) {
    return
  }
  return flowIds
}

function addFlowDependencies(flowIds, flows) {
  return flowIds.map((flow) => {
    const eventDependencies = {}
    flow.eventIds?.forEach((eventId) => {
      const event = flows
        .find((f) => f.id === flow.flowId)
        .events.find((e) => e.id === eventId)
      if (event) {
        eventDependencies[eventId] = [
          { type: 'flow_start', eventIds: event.start_dependencies },
          eventId,
          { type: 'flow_end', eventIds: event.end_dependencies },
        ]
      }
    })
    return {
      ...flow,
      eventIds: Object.values(eventDependencies).flat(),
    }
  })
}

function getFlowStartEventIds(eventIds) {
  const flowStartEventIds = []
  const eventIdsSet = new Set()
  eventIds?.forEach((event) => {
    if (event.type === 'flow_start') {
      event.eventIds?.forEach((eventId) => {
        if (!eventIdsSet.has(eventId)) {
          flowStartEventIds.push(eventId)
          eventIdsSet.add(eventId)
        }
      })
    }
  })
  return flowStartEventIds
}

function getMiddleEvents(eventIds) {
  const middleEvents = []
  eventIds?.forEach((event) => {
    if (typeof event === 'string') {
      middleEvents.push(event)
    } else if (event.type === 'event_start' || event.type === 'event_end') {
      middleEvents.push(...event.eventIds)
    }
  })
  return middleEvents
}

function getFlowEndEventIds(eventIds) {
  const flowEndEventIds = []
  const eventIdsSet = new Set()
  eventIds?.forEach((event) => {
    if (event.type === 'flow_end') {
      event.eventIds.forEach((eventId) => {
        if (eventIdsSet.has(eventId)) {
          flowEndEventIds.splice(flowEndEventIds.indexOf(eventId), 1)
        }
        flowEndEventIds.push(eventId)
        eventIdsSet.add(eventId)
      })
    }
  })
  return flowEndEventIds
}
