import { Event } from './event'
import { MousePointerClickIcon, GlobeIcon, PenLineIcon } from 'lucide-react'

const EVENT_ICONS = {
  input: PenLineIcon,
  click: MousePointerClickIcon,
  default: GlobeIcon,
}

interface EventProps {
  events: any[]
  removeEvent: (event: any) => void
  debugMode?: boolean
  readOnly?: boolean
}

export function Events(props: EventProps) {
  const { events, removeEvent, debugMode = false, readOnly = false } = props

  if (!events?.length) return

  const eventList = events.map((event) => {
    const value = event.value || event.textContent

    return {
      ...event,
      value: debugMode ? `${event.selector}: ${value}` : value,
      icon: EVENT_ICONS[event.type] || EVENT_ICONS.default,
    }
  })

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
