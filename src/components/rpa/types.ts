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
  name: string
  selector: string
  timeStamp: number
  type: string
  value?: string
}
