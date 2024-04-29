import { XIcon } from 'lucide-react'

import { Typography } from '~components/typography'
import { Button } from '~/components/ui/button'

interface ActionProps {
  Icon: typeof XIcon
  type: string
  value: string
}

export function Action({ Icon, type, value }: ActionProps) {
  return (
    <div
      className={`flex items-center gap-4 px-4 py-4 w-full rounded-lg
        border border-transparent group/row`}
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
      <Button
        variant='ghost'
        className={`invisible group-hover/row:visible absolute right-4`}
      >
        <XIcon className='w-4 h-4' />
      </Button>
    </div>
  )
}
