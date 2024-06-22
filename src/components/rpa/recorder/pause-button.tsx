import { CirclePauseIcon, CirclePlayIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'

type PauseButtonProps = {
  onPause: () => void
  isPaused: boolean
}
export function PauseRecordingButton(props: PauseButtonProps) {
  const { onPause, isPaused } = props

  const Icon = isPaused ? CirclePlayIcon : CirclePauseIcon

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className='flex w-full gap-2 items-center group'
          variant={isPaused ? 'default' : 'outline'}
          onClick={onPause}
        >
          <Icon className='w-5 h-5' />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{isPaused ? 'Resume' : 'Pause'}</TooltipContent>
    </Tooltip>
  )
}
