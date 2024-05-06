import { simulateEvent } from './simulate-events'

export async function runEvents({ events, data = {}, onEvent }) {
  console.log('runEvents', events, data)
  let accumulatedDelay = 0
  for (const event of events) {
    const delay = 500 // or event.delay
    await new Promise((resolve) => setTimeout(resolve, delay))
    accumulatedDelay += delay
    if (data[event.name]) {
      event.value = data[event.name]
    }
    simulateEvent(event)
    onEvent(event)
  }
}
