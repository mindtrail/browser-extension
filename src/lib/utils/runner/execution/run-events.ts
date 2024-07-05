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
  const clonedTask = structuredClone(task)
  const clonedEvents = structuredClone(events)

  for (const event of clonedEvents) {
    if (isEventCompleted(task, event)) continue

    const triggerAction = ACTION_COMPONENTS[event.type]
    if (!triggerAction) {
      throw new Error(`No action component found for event type: ${event.type}`)
    }

    if (event.type === 'loop') {
      return await loopComponent({ ...props, event, task: clonedTask, runEvents })
    }

    await onEventStart({ flowId, event, taskId: task.id })
    // if (event.type === 'navigation') {
    //   await onEventEnd({ event, taskId: task.id })
    // }

    await triggerAction({
      flowId,
      task: clonedTask,
      events: clonedEvents,
      event,
      data,
    })

    await onEventEnd({ event, taskId: task.id })
    // if (event.type !== 'navigation') {
    // }
  }
}

// skip event if already found in task.logs and status = 'ended'
// @TODO: test this in a flow with x events and refresh mid through running
function isEventCompleted(task, event) {
  return task.logs.some((log) => log.eventId === event.id && log.status === 'ended')
}
