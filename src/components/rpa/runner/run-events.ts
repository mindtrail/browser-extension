import simulateEvent from './simulate-events'

export default async function runEvents({ events }) {
  console.log('runEvents', events)
  let accumulatedDelay = 0
  for (const event of events) {
    await new Promise((resolve) => setTimeout(resolve, event.delay))
    accumulatedDelay += event.delay
    console.log(event)
    simulateEvent(event)
  }
}
