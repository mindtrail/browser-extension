import { simulateEvent } from './simulate-events'

const delay = 1000 // or event.delay

export async function runEvents({ flowId, events, data = {}, onEvent }) {
  console.log('runEvents', flowId, events, data)
  for (const event of events) {
    event.value = data[event.name] || event.value

    await new Promise((resolve) => setTimeout(resolve, delay))

    simulateEvent(event)
    onEvent(flowId, event)
  }
}
