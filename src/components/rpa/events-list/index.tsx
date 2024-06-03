import {
  MousePointerClickIcon,
  GlobeIcon,
  PenLineIcon,
  TextSelectIcon,
} from 'lucide-react'

import { EVENT_TYPES } from '~lib/constants'
import { Event } from './event'

const EVENT_ICONS = {
  [EVENT_TYPES.INPUT]: PenLineIcon,
  [EVENT_TYPES.CLICK]: MousePointerClickIcon,
  [EVENT_TYPES.EXTRACT]: TextSelectIcon,
  [EVENT_TYPES.NAV]: GlobeIcon,
  default: GlobeIcon,
}

interface EventProps {
  eventsList?: any[]
  debugMode?: boolean
  readOnly?: boolean
  deleteEvent?: (event: any) => void
}

export function EventsList(props: EventProps) {
  const { eventsList = [], deleteEvent, debugMode = false, readOnly = false } = props

  if (!eventsList?.length) return

  const eventsToDisplay = []

  eventsList.forEach((event = {}) => {
    const { value } = event

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
          deleteEvent={deleteEvent}
        />
      ))}
    </div>
  )
}
