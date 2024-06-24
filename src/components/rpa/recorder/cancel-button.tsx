import { TrashIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'

type RecordButtonProps = {
  onCancel: () => void
  className?: string
}
export function CancelRecordingButton(props: RecordButtonProps) {
  const { onCancel, className = '' } = props

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant='outline'
          onClick={onCancel}
          className={'flex w-full items-center gap-4'}
        >
          <TrashIcon className='w-5 h-5 text-foreground/70' />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Cancel Recording (Esc)</TooltipContent>
    </Tooltip>
  )
}
