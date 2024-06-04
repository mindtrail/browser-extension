import { DOM_EVENT } from '~/lib/constants'

interface Event {
  type: DOM_EVENT
  handler: (event: any) => any
}

export function addEventListeners(eventList: Event[]) {
  eventList.forEach(({ type, handler }) => document.addEventListener(type, handler, true))
}

export function removeEventListeners(eventList: Event[]) {
  eventList.forEach(({ type, handler }) =>
    document.removeEventListener(type, handler, true),
  )
}
