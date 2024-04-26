import { simulateEvent } from './simulate-events'

export async function runEvents({ events, data = {}, callback }) {
  console.log('runEvents', events)
  let accumulatedDelay = 0
  for (const event of events) {
    const delay = 500 // or event.delay
    await new Promise((resolve) => setTimeout(resolve, delay))
    accumulatedDelay += delay
    if (data[event.name]) {
      event.value = data[event.name]
    }
    console.log(event)
    simulateEvent(event)
    callback(event)
  }
}
