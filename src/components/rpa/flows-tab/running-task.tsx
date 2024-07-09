import { CirclePlayIcon, CircleStopIcon, CirclePauseIcon } from 'lucide-react'

import { Typography } from '~/components/typography'
import { Button } from '~/components/ui/button'
import { TASK_STATUS } from '~/lib/constants'

import { RunningEventsList } from '../events-list'

interface RunningTaskProps {
  runningTask: any
  runningFlow: any
  eventsCompleted: any[]
  onStop: (status: TASK_STATUS) => void
  onPause?: () => void
}

export function RunningTask(props: RunningTaskProps) {
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
          <Button
            onClick={() => onStop(TASK_STATUS.STOPPED)}
            variant='ghost'
            className='flex items-center gap-2'
          >
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

      <RunningEventsList eventsList={eventsList} eventsCompleted={eventsCompleted} />
    </div>
  )
}
