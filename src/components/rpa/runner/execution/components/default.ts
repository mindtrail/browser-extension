import { simulateEvent } from '../simulate-events'
const delay = 250
// const delay = 1000

export async function defaultComponent({
  flowId,
  event,
  data,
  onEventStart,
  onEventEnd,
}) {
  await onEventStart(flowId, event)
  event.value = data[event.name] || event.value
  await new Promise((resolve) => setTimeout(resolve, delay))
  simulateEvent(event)
  await new Promise((resolve) => setTimeout(resolve, delay))
  await onEventEnd(flowId, event)
}
