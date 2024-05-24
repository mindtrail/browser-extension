import { Event } from './event'
import { MousePointerClickIcon, GlobeIcon, PenLineIcon } from 'lucide-react'

const EVENT_ICONS = {
  input: PenLineIcon,
  click: MousePointerClickIcon,
  default: GlobeIcon,
}

interface EventProps {
  eventsMap?: Map<string, any[]>
  eventsList?: any[]
  removeEvent?: (event: any) => void
  debugMode?: boolean
  readOnly?: boolean
}

export function Events(props: EventProps) {
  const {
    eventsMap,
    eventsList = [],
    removeEvent,
    debugMode = false,
    readOnly = false,
  } = props

  if (!eventsMap?.size && !eventsList?.length) return

  const eventsToDisplay = []
  const collectionToIterate = readOnly ? eventsList : eventsMap

  collectionToIterate.forEach((eventsArray) => {
    const event = readOnly ? eventsArray : eventsArray[eventsArray.length - 1]
    const value = event.value || event.textContent || event.url

    eventsToDisplay.push({
      ...event,
      value: debugMode ? `${event.selector}: ${value}` : value,
      icon: EVENT_ICONS[event.type] || EVENT_ICONS.default,
      count: readOnly ? eventsArray.length : undefined,
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
