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
      className={`flex items-center gap-4 px-2 py-4 w-full rounded-lg
                border border-transparent hover:border-border group/row`}
    >
      <div className='flex items-center justify-center w-8 h-8 rounded-full  border-foreground/50'>
        <Icon className='h-5 w-5 text-foreground/50' />
      </div>
      <div className='flex flex-col gap-1'>
        <Typography className='capitalize' variant='small-semi'>
          {type}
        </Typography>
        <Typography variant='small'>{value}</Typography>
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
