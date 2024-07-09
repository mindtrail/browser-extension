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
import { RecordingEvent } from './recording-event'

const EVENT_ICONS = {
  [ACTION_TYPE.INPUT]: PenLineIcon,
  [ACTION_TYPE.CLICK]: MousePointerClickIcon,
  [ACTION_TYPE.EXTRACT]: TextSelectIcon,
  [ACTION_TYPE.NAV]: GlobeIcon,
  default: GlobeIcon,
}

interface EventsListProps {
  eventsList?: any[]
  debugMode?: boolean
  deleteEvent?: (event: any) => void
}

export function RecordingEventsList(props: EventsListProps) {
  const { eventsList = [], debugMode = false, deleteEvent } = props
  const [showAllEvents, setShowAllEvents] = useState(false)

  if (!eventsList?.length) return null

  const eventsToDisplay = eventsList.slice(showAllEvents ? 0 : -2).map((event) => ({
    ...event,
    value: debugMode ? `${event.selector}: ${event.value}` : event.value,
    icon: EVENT_ICONS[event.type] || EVENT_ICONS.default,
  }))

  return (
    <div className='flex flex-col shrink-0 w-full cursor-default overflow-auto'>
      {eventsList.length > 2 && (
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
        <RecordingEvent
          key={index}
          index={index}
          event={event}
          deleteEvent={deleteEvent}
        />
      ))}
    </div>
  )
}
