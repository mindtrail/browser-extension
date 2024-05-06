import { Event } from './event'
import { MousePointerClickIcon, GlobeIcon, PenLineIcon } from 'lucide-react'

const EVENT_ICONS = {
  input: PenLineIcon,
  click: MousePointerClickIcon,
  default: GlobeIcon,
}

interface EventProps {
  eventsMap: Map<string, any[]>
  removeEvent: (event: any) => void
  debugMode?: boolean
  readOnly?: boolean
}

export function Events(props: EventProps) {
  const { eventsMap, removeEvent, debugMode = false, readOnly = false } = props

  if (!eventsMap?.size) return

  const eventList = []

  eventsMap.forEach((eventsArray) => {
    const event = eventsArray[0]
    const value = event.value || event.textContent

    eventList.push({
      ...event,
      value: debugMode ? `${event.selector}: ${value}` : value,
      icon: EVENT_ICONS[event.type] || EVENT_ICONS.default,
      count: eventsArray.length,
    })
  })

  // console.log(222, eventList)

  return (
    <div className='flex flex-col shrink-0 w-full cursor-default overflow-auto'>
      {eventList.map((event, index) => (
        <Event
          key={index}
          event={event}
          readOnly={readOnly}
          index={index}
          removeEvent={removeEvent}
        />
      ))}
    </div>
  )
}
