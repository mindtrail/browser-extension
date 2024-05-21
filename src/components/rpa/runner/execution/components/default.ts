import { simulateEvent } from '../simulate-events'

export async function defaultComponent({
  flowId,
  event,
  data,
  onEventStart,
  onEventEnd,
}) {
  await onEventStart(flowId, event)
  event.value = data[event.name] || event.value
  await new Promise((resolve) => setTimeout(resolve, 500))
  simulateEvent(event)
  await new Promise((resolve) => setTimeout(resolve, 500))
  await onEventEnd(flowId, event)
}
