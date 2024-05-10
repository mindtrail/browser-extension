import { getFlowEvents } from '../../utils/get-flow-events'
import { extractParams } from '../../utils/groq'
import { search } from '../../utils/openai'
import { buildParamsSchema } from './build-params-schema'
import { runEvents } from './run-events'
import { extractTableEntities } from './extract-entities'

export async function runFlows({ flows, flowsToRun, query, onEvent }) {
  for (const { flowId, eventIds } of flowsToRun) {
    const events = getFlowEvents(flows, flowId).filter((event) =>
      eventIds.includes(event.id),
    )

    events.sort((a, b) => eventIds.indexOf(a.id) - eventIds.indexOf(b.id))

    // Work in progress..
    if (query) {
      const schema = buildParamsSchema(events)
      console.log('schema', schema)

      const entities = await extractTableEntities({
        columns: Object.keys(schema),
        entitySelectorPattern: events[0].selector,
      })
      console.log('entities', entities)

      const filteredEntities = await search({ query, entities })
      console.log('filteredEntities', filteredEntities)

      // Build an array of events for each entity
      // Update selector for first event to use the entity selector
      const entityEvents = filteredEntities.map((entity) => {
        return events.map((event, index) => {
          if (index === 0 && event.selector.includes('table')) {
            console.log(
              'prev Selector',
              event.selector,
              document.querySelector(event.selector),
            )
            console.log(
              'new Selector',
              entity.selector,
              document.querySelector(entity.selector),
            )
            return { ...event, selector: entity.selector }
          }
          return event
        })
      })
      console.log('entityEvents', entityEvents)

      // extract or generate data for each entity
      const entityData = await extractParams({
        query,
        schema,
        entities: filteredEntities.map((entity) => {
          const schemaKeys = Object.keys(schema)
          let mappedEntity = {}
          schemaKeys.forEach((key) => {
            mappedEntity[key] =
              schema[key] === 'number' ? parseFloat(entity[key]) : entity[key]
          })
          return mappedEntity
        }),
      })
      console.log('entityData', entityData)

      // work in progress..
      if (entityEvents.length) {
        // identified entities scenario
        for (const [index, arr] of entityEvents.entries()) {
          const runData = {
            flowId,
            events: arr,
            data: entityData[index],
            onEvent,
          }
          console.log('v1 runData', runData)
          await runEvents(runData)
        }
      } else {
        // data but no entities scenario
        for (const data of entityData) {
          const runData = {
            flowId,
            events,
            data,
            onEvent,
          }
          console.log('v2 runData', runData)
          await runEvents(runData)
        }
      }
    } else {
      // no query scenario
      const runData = {
        flowId,
        events,
        data: {},
        onEvent,
      }
      console.log('v3 runData', runData)
      await runEvents(runData)
    }
  }
}
