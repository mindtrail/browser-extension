import simulateEvent from './simulate-events'

export default async function runEvents({ events, callback }) {
  console.log('runEvents', events)
  let accumulatedDelay = 0
  for (const event of events) {
    const delay = 500 // or event.delay
    await new Promise((resolve) => setTimeout(resolve, delay))
    accumulatedDelay += delay
    console.log(event)
    simulateEvent(event)
    callback(event)
  }
}
