import { Trash2Icon } from 'lucide-react'

import { Typography } from '~components/typography'
import { Button } from '~/components/ui/button'

interface Event {
  type: string
  value: string
  icon: typeof Trash2Icon
  count?: number
}

interface EventProps {
  event: Event
  index: number
  deleteEvent: (index: number) => void
}

export function RunningEvent(props: EventProps) {
  const { event, index } = props
  const { type, value, icon: Icon, count } = event

  return (
    <div
      className={`flex items-center gap-4 px-4 py-2 w-full relative
        rounded-lg overflow-hidden border border-transparent group/row`}
    >
      <Icon className='h-5 w-5 shrink-0 text-foreground/50' />
      <div className='flex flex-col flex-1 gap-1'>
        <Typography variant='small-semi' className='capitalize'>
          {type}
        </Typography>
        <Typography
          variant='small'
          className='max-w-[80%] text-ellipsis overflow-hidden whitespace-nowrap'
        >
          {value}
          {count > 1 && <span className='text-foreground/50'> ({count})</span>}
        </Typography>
      </div>
    </div>
  )
}
