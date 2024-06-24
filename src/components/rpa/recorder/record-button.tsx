import { LoaderCircleIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { StartRecordingIcon, StopRecordingIcon } from '~/components/icons/record'

interface RecordButtonProps {
  isRecording: boolean
  isPaused: boolean
  isSaving: boolean
  onToggleRecording: () => void
}
export function RecordButton(props: RecordButtonProps) {
  const { isRecording, isPaused, isSaving, onToggleRecording } = props

  const Icon = isSaving
    ? LoaderCircleIcon
    : isRecording
    ? StopRecordingIcon
    : StartRecordingIcon

  return (
    <Button
      className='flex w-full gap-4 items-center'
      variant={isRecording && !isPaused ? 'default' : 'outline'}
      onClick={onToggleRecording}
    >
      <Icon
        className={`w-5 h-5 text-red-600
          ${
            isSaving
              ? 'animate-spin !text-primary-foreground'
              : isRecording && !isPaused
              ? 'animate-pulse'
              : ''
          }`}
      />
      {isSaving ? 'Saving...' : isRecording ? 'Save Recording' : 'Record New Workflow'}
    </Button>
  )
}
