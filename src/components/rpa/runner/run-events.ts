import simulateEvent from './simulate-events'

export default function runEvents({ events }) {
  events.forEach((event) => {
    setTimeout(() => {
      console.log(event)
      simulateEvent(event)
    }, event.delay)
  })
}
