import { RotateCcwIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'

type RestartButtonProps = {
  onRestart: () => void
}
export function RestartRecordingButton(props: RestartButtonProps) {
  const { onRestart } = props

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className='flex w-full gap-2 items-center group'
          variant='outline'
          onClick={onRestart}
        >
          <RotateCcwIcon className='w-5 h-5' />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Restart</TooltipContent>
    </Tooltip>
  )
}
