import { XIcon } from 'lucide-react'

import { Typography } from '~components/typography'
import { Button } from '~/components/ui/button'

import { BuilderItem } from './item'
import { mockData } from '../constants'

export function FlowBuilder() {
  return (
    <div className='flex flex-col w-full px-2 py-2 cursor-default'>
      {mockData.map(({ type, value, icon: Icon }, index) => (
        <BuilderItem Icon={Icon} type={type} value={value} key={index} />
      ))}

      <div
        className={`flex items-center gap-4 px-2 py-4 w-full
              rounded-lg border border-dashed`}
      >
        <div className='w-8 h-8 rounded-full border border-dashed bg-accent/50' />
        <div className='flex flex-col gap-1'>
          <Typography className='capitalize text-foreground/50' variant='small-semi'>
            Next action
          </Typography>
        </div>
        <Button
          variant='secondary'
          className={`invisible group-hover/row:visible absolute right-4`}
        >
          <XIcon className='w-4 h-4' />
        </Button>
      </div>
    </div>
  )
}
