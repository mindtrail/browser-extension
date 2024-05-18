import { simulateEvent } from './simulate-events'

const delay = 500 // or event.delay

export async function runEvents({ flowId, events, data = {}, onEventStart, onEventEnd }) {
  events = structuredClone(events)
  for (const event of events) {
    await onEventStart(flowId, event)

    event.value = data[event.name] || event.value
    simulateEvent(event)
    await new Promise((resolve) => setTimeout(resolve, delay))

    await onEventEnd(flowId, event)
  }
}
