import { inputComponent } from './components/input'
import { clickComponent } from './components/click'
import { loopComponent } from './components/loop'
import { extractComponent } from './components/extract'
import { navigationComponent } from './components/navigation'
import { googleSheetsComponent } from './components/google-sheets'

const components = {
  input: inputComponent,
  click: clickComponent,
  loop: loopComponent,
  extract: extractComponent,
  navigation: navigationComponent,
  'google-sheets': googleSheetsComponent,
}

export async function runEvents({
  flowId,
  task,
  events,
  data = {},
  onEventStart,
  onEventEnd,
}) {
  const clonedTask = structuredClone(task)
  const clonedEvents = structuredClone(events)

  for (const event of clonedEvents) {
    // skip event if already found in task.logs and status = 'ended'
    if (task.logs.find((log) => log.eventId === event.id && log.status === 'ended')) {
      continue
    }
    const component = components[event.type]
    if (!component) break

    await component({
      flowId,
      task: clonedTask,
      events: clonedEvents,
      event,
      data,
      onEventStart,
      onEventEnd,
      runEvents,
    })
  }
}
