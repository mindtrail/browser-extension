import { XIcon } from 'lucide-react'

import { Typography } from '~components/typography'
import { Button } from '~/components/ui/button'

interface Event {
  type: string
  value: string
  icon: typeof XIcon
}

interface EventProps {
  event: Event
  readOnly: boolean
  index: number
}

export function Event({ event, readOnly, index }: EventProps) {
  const { type, value, icon: Icon } = event

  return (
    <div
      className={`flex items-center gap-4 px-4 py-2 w-full rounded-lg
        border border-transparent group/row ${index % 2 === 0 ? 'bg-white' : ''}`}
    >
      <Icon className='h-5 w-5 text-foreground/50 group-hover/row:text-foreground' />
      <div className='flex flex-col gap-1'>
        <Typography
          variant='small-semi'
          className='capitalize group-hover/row:text-foreground'
        >
          {type}
        </Typography>
        <Typography variant='small' className='group-hover/row:text-foreground'>
          {value}
        </Typography>
      </div>
      {!readOnly && (
        <Button
          variant='ghost'
          className={`invisible group-hover/row:visible absolute right-2`}
        >
          <XIcon className='w-4 h-4' />
        </Button>
      )}
    </div>
  )
}
