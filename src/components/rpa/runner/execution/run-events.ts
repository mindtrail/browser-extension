import { inputComponent } from './components/input'
import { clickComponent } from './components/click'
import { loopComponent } from './components/loop'
import { extractComponent } from './components/extract'
import { urlComponent } from './components/url'

const components = {
  input: inputComponent,
  click: clickComponent,
  loop: loopComponent,
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
    const component = components[event.type]
    if (!component) continue
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
