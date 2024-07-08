import { Trash2Icon } from 'lucide-react'

import { Typography } from '~components/typography'
import { IconSpinner } from '~components/icons/spinner'

interface Event {
  type: string
  value: string
  icon: typeof Trash2Icon
  count?: number
  inProgress?: boolean
}

interface EventProps {
  event: Event
}

export function RunningEvent({ event }: EventProps) {
  const { type, value, icon: Icon, count, inProgress } = event

  return (
    <div
      className={`flex items-center gap-4 px-4 py-2 w-full relative
        rounded-lg overflow-hidden border border-transparent group/row
        ${inProgress ? '!text-primary' : ''}
        `}
    >
      <Icon
        className={`h-5 w-5 shrink-0  ${
          inProgress ? '!text-primary' : 'text-foreground/50'
        }`}
      />
      <div className='flex flex-col flex-1 gap-1'>
        <Typography
          variant='small-semi'
          className={`capitalize ${inProgress ? '!text-primary' : ''}`}
        >
          {type}
        </Typography>
        <Typography
          variant='small'
          className={`max-w-[80%] text-ellipsis overflow-hidden whitespace-nowrap
            ${inProgress ? '!text-primary' : ''}
          `}
        >
          {value}
          {count > 1 && <Typography variant='small'> ({count})</Typography>}
        </Typography>
      </div>
      {inProgress && <IconSpinner />}
    </div>
  )
}
