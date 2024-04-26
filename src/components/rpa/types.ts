export interface Flows {
  [key: string]: Flow
}

export interface Flow {
  id: string
  name: string
  description: string
  actions: Action[]
  events: DOMEvent[]
}

export interface Action {
  id: string
  name: string
  description: string
  type: string
  previous: {
    id: string
  }
  next: {
    id: string
  }
}

export interface DOMEvent {
  selector: string
  type: string
  value?: string
  name: string
  textContent: string
  timeStamp: number
}
