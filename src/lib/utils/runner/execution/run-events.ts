import { inputComponent } from './components/input'
import { clickComponent } from './components/click'
import { loopComponent } from './components/loop'
import { extractComponent } from './components/extract'
import { navigationComponent } from './components/navigation'
import { googleSheetsComponent } from './components/google-sheets'

const ACTION_COMPONENTS = {
  input: inputComponent,
  click: clickComponent,
  loop: loopComponent,
  extract: extractComponent,
  navigation: navigationComponent,
  'google-sheets': googleSheetsComponent,
}

export async function runEvents(props: RunnerEventProps) {
  const { flowId, task, events, data, onEventStart, onEventEnd } = props
  console.log(props)
  const clonedTask = structuredClone(task)
  const clonedEvents = structuredClone(events)

  for (const event of clonedEvents) {
    // skip event if already found in task.logs and status = 'ended'
    // @TODO: test this in a flow with x events and refresh mid through running
    if (task.logs.find((log) => log.eventId === event.id && log.status === 'ended')) {
      continue
    }
    const triggerAction = ACTION_COMPONENTS[event.type]
    if (!triggerAction) break

    await triggerAction({
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
