import { useState } from 'react'
import {
  MousePointerClickIcon,
  GlobeIcon,
  PenLineIcon,
  TextSelectIcon,
} from 'lucide-react'

import { ACTION_TYPE } from '~lib/constants'
import { Switch } from '~components/ui/switch'
import { Label } from '~components/ui/label'
import { Event } from './event'

const EVENT_ICONS = {
  [ACTION_TYPE.INPUT]: PenLineIcon,
  [ACTION_TYPE.CLICK]: MousePointerClickIcon,
  [ACTION_TYPE.EXTRACT]: TextSelectIcon,
  [ACTION_TYPE.NAV]: GlobeIcon,
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
  const [showAllEvents, setShowAllEvents] = useState(false)

  if (!eventsList?.length) return

  const eventsToDisplay = []

  // Only show the last 2 events
  eventsList.slice(showAllEvents ? 0 : -2).forEach((event) => {
    if (!event?.value) return

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
      {eventsList?.length > 2 && (
        <div className='flex items-center justify-between mb-4'>
          <span>...</span>
          <div className='flex gap-4'>
            <Label htmlFor='show-all-events'>Show All</Label>
            <Switch
              id='show-all-events'
              checked={showAllEvents}
              onCheckedChange={setShowAllEvents}
            />
          </div>
        </div>
      )}
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
