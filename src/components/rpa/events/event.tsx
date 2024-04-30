import { Trash2Icon } from 'lucide-react'

import { Typography } from '~components/typography'
import { Button } from '~/components/ui/button'

interface Event {
  type: string
  value: string
  icon: typeof Trash2Icon
}

interface EventProps {
  event: Event
  readOnly: boolean
  index: number
  removeEvent: (event: Event) => void
}

export function Event({ event, readOnly, index, removeEvent }: EventProps) {
  const { type, value, icon: Icon } = event

  return (
    <div
      className={`flex items-center gap-4 px-4 py-2 w-full relative
        rounded-lg overflow-hidden border border-transparent group/row
        ${index % 2 === 0 ? 'bg-white' : ''}`}
    >
      <Icon className='h-5 w-5 shrink-0 text-foreground/50 group-hover/row:text-foreground' />
      <div className='flex flex-col flex-1 gap-1'>
        <Typography
          variant='small-semi'
          className='capitalize group-hover/row:text-foreground'
        >
          {type}
        </Typography>
        <Typography
          variant='small'
          className='group-hover/row:text-foreground max-w-[80%] text-ellipsis overflow-hidden whitespace-nowrap'
        >
          {value}
        </Typography>
      </div>
      {!readOnly && (
        <Button
          variant='secondary'
          className={`invisible group-hover/row:visible absolute right-0`}
          onClick={() => removeEvent(event)}
        >
          <Trash2Icon className='w-4 h-4' />
        </Button>
      )}
    </div>
  )
}
