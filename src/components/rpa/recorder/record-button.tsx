import { CirclePauseIcon, SaveIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { RecordIcon } from '~/components/icons/record'

interface RecordButtonProps {
  onToggleRecording: () => void
  onPause: () => void
  isRecording: boolean
  paused: boolean
}
export function RecordButton(props: RecordButtonProps) {
  const { onPause, onToggleRecording, isRecording, paused } = props

  return isRecording ? (
    <div className='flex w-full gap-2 items-center'>
      <Button
        className='flex w-full gap-2 items-center'
        variant='outline'
        onClick={onPause}
      >
        {paused ? (
          <RecordIcon className='w-5 h-5' />
        ) : (
          <CirclePauseIcon className='w-5 h-5' />
        )}
        {paused ? 'Resume' : '  Pause'}
      </Button>
      <Button
        className='flex w-full gap-2 items-center'
        variant='default'
        onClick={onToggleRecording}
      >
        <SaveIcon className='w-5 h-5 ' />
        Save
      </Button>
    </div>
  ) : (
    <Button
      className='flex w-full gap-4 items-center'
      variant='outline'
      onClick={onToggleRecording}
    >
      <RecordIcon className='w-5 h-5' />
      Record New Workflow
    </Button>
  )
}
