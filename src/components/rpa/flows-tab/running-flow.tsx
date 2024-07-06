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
  runningTask: any
  runningFlow: any
  eventsCompleted: any[]
  onStop: () => void
  onPause?: () => void
}

export function RunningFlow(props: RunningFlowProps) {
  const { runningFlow, runningTask, eventsCompleted, onStop, onPause } = props
  if (!runningTask || !runningFlow) return null

  const { name, description, events: eventsList } = runningFlow

  return (
    <div className='flex flex-col flex-1 gap-6'>
      <div className='flex flex-col gap-2'>
        <div className='flex items-center gap-2'>
          <CirclePlayIcon className='w-5 h-5 text-primary' />
          <Typography variant='h4' className='text-primary'>
            {name}
          </Typography>
        </div>
        <div className='flex justify-between gap-4'>
          <Button onClick={onStop} variant='ghost' className='flex items-center gap-2'>
            <CircleStopIcon className='w-5 h-5' />
            Stop
          </Button>
          <Button onClick={onPause} variant='ghost' className='flex items-center gap-2'>
            <CirclePauseIcon className='w-5 h-5' />
            Pause
          </Button>
        </div>
      </div>

      <Typography variant='small-semi'>{description}</Typography>

      <div className='flex flex-col flex-1 gap-4'>
        <EventsList eventsList={eventsList} readOnly={true} />

        {eventsCompleted?.length === eventsList?.length && (
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
