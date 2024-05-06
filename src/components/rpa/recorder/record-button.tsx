import { CirclePauseIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { RecordIcon, SaveRecordingIcon } from '~/components/icons/record'

interface RecordButtonProps {
  onToggle: () => void
  onPause: () => void
  recording: boolean
  paused: boolean
}
export function RecordButton(props: RecordButtonProps) {
  const { onPause, onToggle, recording, paused } = props

  return recording ? (
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
