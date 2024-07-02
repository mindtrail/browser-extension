import {
  CheckCheckIcon,
  CirclePlayIcon,
  CircleStopIcon,
  CirclePauseIcon,
} from 'lucide-react'

import { Typography } from '~/components/typography'
import { Button } from '~components/ui/button'

import { EventsList } from '../events-list'

interface RunningFlowProps {
  flowsRunning: string[]
  flows: any[]
  eventsList: any[]
}

export function RunningFlow({ flowsRunning, flows, eventsList }: RunningFlowProps) {
  if (!flowsRunning.length) {
    return null
  }

  const flow = flows.find((flow) => flow.id === flowsRunning[0])
  console.log(flow, eventsList)

  const currentFlowEvents = flow.events

  return (
    <div className='flex flex-col flex-1 gap-6'>
      <div className='flex flex-col gap-2'>
        <div className='flex items-center gap-2'>
          <CirclePlayIcon className='w-5 h-5 text-primary' />
          <Typography variant='h4' className='text-primary'>
            {flow.name}
          </Typography>
        </div>
        <div className='flex justify-between gap-4'>
          <Button variant='outline' className='flex items-center gap-2'>
            <CircleStopIcon className='w-5 h-5' />
            Stop
          </Button>
          <Button variant='outline' className='flex items-center gap-2'>
            <CirclePauseIcon className='w-5 h-5' />
            Pause
          </Button>
        </div>
      </div>

      <Typography variant='small-semi'>{flow.description}</Typography>

      <div className='flex flex-col flex-1 gap-4'>
        <EventsList eventsList={eventsList} readOnly={true} />

        {eventsList?.length === currentFlowEvents?.length && (
          <Typography
            variant='small-semi'
            className='flex items-center gap-2 px-6 text-primary'
          >
            <CheckCheckIcon className='w-5 h-5' />
            Run complete
          </Typography>
        )}
      </div>
    </div>
  )
}
