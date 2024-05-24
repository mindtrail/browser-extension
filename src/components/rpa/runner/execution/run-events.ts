import { loopComponent } from './components/loop'
import { defaultComponent } from './components/default'
import { extractComponent } from './components/extract'
import { urlComponent } from './components/url'

const components = {
  loop: loopComponent,
  default: defaultComponent,
  extract: extractComponent,
  url: urlComponent,
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
    // skip event if already found in task.logs
    if (task.logs.find((log) => log.eventId === event.id)) continue
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
