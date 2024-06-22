import { CirclePauseIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'

type RecordButtonProps = {
  onPause: () => void
  isPaused: boolean
}
export function CancelRecordingButton(props: RecordButtonProps) {
  const { onPause, isPaused } = props

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className='flex w-full gap-2 items-center group'
          variant='outline'
          onClick={onPause}
        >
          <CirclePauseIcon className='w-5 h-5' />
          {isPaused ? 'Resume' : 'Pause'}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Pause Recording</TooltipContent>
    </Tooltip>
  )
}
