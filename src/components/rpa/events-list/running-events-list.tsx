import { MousePointerClickIcon, GlobeIcon, PenLineIcon, TextSelectIcon } from 'lucide-react'
import { ACTION_TYPE } from '~lib/constants'
import { Event } from './event'

const EVENT_ICONS = {
  [ACTION_TYPE.INPUT]: PenLineIcon,
  [ACTION_TYPE.CLICK]: MousePointerClickIcon,
  [ACTION_TYPE.EXTRACT]: TextSelectIcon,
  [ACTION_TYPE.NAV]: GlobeIcon,
  default: GlobeIcon,
}

interface RunningEventsListProps {
  eventsList: any[]
  eventsCompleted: number
  debugMode?: boolean
}

export function RunningEventsList({ eventsList, eventsCompleted, debugMode = false }: RunningEventsListProps) {
  if (!eventsList?.length) return null

  const eventsToDisplay = eventsList.map((event, index) => ({
    ...event,
    value: debugMode ? `${event.selector}: ${event.value}` : event.value,
    icon: EVENT_ICONS[event.type] || EVENT_ICONS.default,
    completed: index < eventsCompleted
  }))

  return (
    <div className='flex flex-col shrink-0 w-full cursor-default overflow-auto'>
      {eventsToDisplay.map((event, index) => (
        <Event
          key={index}
          event={event}
          readOnly={true}
          index={index}
          deleteEvent={undefined}
        />
      ))}
    </div>
  )
}