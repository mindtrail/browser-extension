import { TASK_STATUS } from '~/lib/constants'

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
  const { task, events, abortSignal } = props
  const clonedTask = structuredClone(task)
  const clonedEvents = structuredClone(events)

  for (const event of clonedEvents) {
    if (abortSignal?.aborted) {
      break
    }

    if (isEventCompleted(task, event)) continue

    const triggerAction = ACTION_COMPONENTS[event.type]
    if (!triggerAction) {
      throw new Error(`No action component found for event type: ${event.type}`)
    }

    await triggerAction({
      ...props,
      event,
      task: clonedTask,
      events: clonedEvents,
    })
  }
}

// skip event if already found in task.logs and status = 'ended'
// @TODO: test this in a flow with x events and refresh mid through running
function isEventCompleted(task, event) {
  return task.logs.some(
    (log) => log.eventId === event.id && log.status === TASK_STATUS.COMPLETED,
  )
}
