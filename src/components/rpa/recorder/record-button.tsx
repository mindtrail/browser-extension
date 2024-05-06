import { CirclePauseIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { RecordIcon, SaveRecordingIcon } from '~/components/icons/record'

interface RecordButtonProps {
  onToggle: () => void
  onPause: () => void
  recording: boolean
}
export function RecordButton({ onPause, onToggle, recording }: RecordButtonProps) {
  return recording ? (
    <div className='flex w-full gap-2 items-center'>
      <Button
        className='flex w-full gap-2 items-center'
        variant='outline'
        onClick={onPause}
      >
        <CirclePauseIcon className='w-5 h-5' />
        Pause
      </Button>
      <Button
        className='flex w-full gap-2 items-center'
        variant='default'
        onClick={onToggle}
      >
        <SaveRecordingIcon className='w-5 h-5 ' />
        Save
      </Button>
    </div>
  ) : (
    <Button
      className='flex w-full gap-4 items-center'
      variant='outline'
      onClick={onToggle}
    >
      <RecordIcon className='w-5 h-5' />
      Record New Workflow
    </Button>
  )
}
