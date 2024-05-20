import { loopComponent } from './components/loop'
import { defaultComponent } from './components/default'
import { extractComponent } from './components/extract'

// considering using "components" instead of "events" as name
const components = {
  loop: loopComponent,
  default: defaultComponent,
  extract: extractComponent,
}

export async function runEvents({
  task,
  flowId,
  events,
  data = {},
  onEventStart,
  onEventEnd,
}) {
  task = structuredClone(task)
  events = structuredClone(events)

  for (const event of events) {
    const component = components[event.type] || components.default
    await component({
      task,
      flowId,
      event,
      data,
      onEventStart,
      onEventEnd,
      runEvents,
      events,
    })
  }
}
