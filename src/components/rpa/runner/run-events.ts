import simulateEvent from './simulate-events'

export default function runEvents({ events }) {
  events.forEach((event, index) => {
    let delay = 0.5 * index * event.delay

    // if (event.type === 'input') {
    //   delay = Math.min(delay, 100);
    // }

    setTimeout(() => {
      simulateEvent(event)
    }, delay)
  })
}
