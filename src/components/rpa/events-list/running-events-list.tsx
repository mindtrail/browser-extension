import {
  CheckCheckIcon,
  MousePointerClickIcon,
  GlobeIcon,
  PenLineIcon,
  TextSelectIcon,
} from 'lucide-react'

import { ACTION_TYPE, TASK_STATUS } from '~lib/constants'
import { Typography } from '~/components/typography'
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
  eventsCompleted: any[]
}

export function RunningEventsList(props: RunningEventsListProps) {
  const { eventsList = [], eventsCompleted = [] } = props
  if (!eventsList?.length) return null

  const allEventsCompleted =
    eventsCompleted?.length &&
    eventsCompleted?.length === eventsList?.length &&
    eventsCompleted[eventsCompleted.length - 1]?.status === TASK_STATUS.COMPLETED

  const eventsToDisplay = eventsList.map((event, index) => ({
    ...event,
    value: event.value,
    icon: EVENT_ICONS[event.type] || EVENT_ICONS.default,
    completed: index < eventsCompleted?.length,
  }))

  return (
    <div className='flex flex-col flex-1 gap-4'>
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
      {!!allEventsCompleted && (
        <Typography
          variant='small-semi'
          className='flex items-center gap-2 px-6 text-primary'
        >
          <CheckCheckIcon className='w-5 h-5' />
          Run complete
        </Typography>
      )}
    </div>
  )
}
