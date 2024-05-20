import { simulateEvent } from '../simulate-events'
const delay = 500 // or event.delay

export async function defaultComponent({
  flowId,
  event,
  data,
  onEventStart,
  onEventEnd,
}) {
  await onEventStart(flowId, event)
  event.value = data[event.name] || event.value
  simulateEvent(event)
  await new Promise((resolve) => setTimeout(resolve, delay))
  await onEventEnd(flowId, event)
}
