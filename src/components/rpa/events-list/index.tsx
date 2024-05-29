import { Event } from './event'
import { MousePointerClickIcon, GlobeIcon, PenLineIcon } from 'lucide-react'

const EVENT_ICONS = {
  input: PenLineIcon,
  click: MousePointerClickIcon,
  default: GlobeIcon,
}

interface EventProps {
  eventsList?: any[]
  debugMode?: boolean
  readOnly?: boolean
  removeEvent?: (event: any) => void
}

export function EventsList(props: EventProps) {
  const { eventsList = [], removeEvent, debugMode = false, readOnly = false } = props

  if (!eventsList?.length) return

  const eventsToDisplay = []

  eventsList.forEach((event) => {
    const value = event.value || event.textContent

    eventsToDisplay.push({
      ...event,
      value: debugMode ? `${event.selector}: ${value}` : value,
      icon: EVENT_ICONS[event.type] || EVENT_ICONS.default,
      count: event?.count,
    })
  })

  return (
    <div className='flex flex-col shrink-0 w-full cursor-default overflow-auto'>
      {eventsToDisplay.map((event, index) => (
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
