import { extractParams } from '~lib/llm/openai'
import { buildParamsSchema } from './build-params-schema'
import { runEvents } from './run-events'
import { extractTable } from './extract-table'

export async function processQuery({
  task,
  flowId,
  events,
  query,
  onEventStart,
  onEventEnd,
}) {
  const schema = buildParamsSchema(events)
  console.log('schema', schema)

  const entities = await extractTable(events[0].selector)
  console.log('entities', entities)

  // const filteredEntities = await search({ query, entities })
  // console.log('filteredEntities', filteredEntities)
  const filteredEntities = entities

  // Build an array of events for each entity
  // Update selector for first event to use the entity selector
  const entityEvents = filteredEntities.map((entity) => {
    return events.map((event, index) => {
      if (index === 0 && event.selector.default.includes('table')) {
        console.log(
          'prev Selector',
          event.selector.default,
          document.querySelector(event.selector.default),
        )
        console.log(
          'new Selector',
          entity.selector.default,
          document.querySelector(entity.selector.default),
        )
        return { ...event, selector: entity.selector.default }
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
        task,
        flowId,
        events: arr,
        data: entityData[index],
        onEventStart,
        onEventEnd,
      }
      console.log('v1 runData', runData)
      await runEvents(runData)
    }
  } else {
    // data but no entities scenario
    for (const data of entityData) {
      const runData = {
        task,
        flowId,
        events,
        data,
        onEventStart,
        onEventEnd,
      }
      console.log('v2 runData', runData)
      await runEvents(runData)
    }
  }
}
