import { LoaderCircleIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { StartRecordingIcon, StopRecordingIcon } from '~/components/icons/record'

interface RecordButtonProps {
  onToggleRecording: () => void
  isRecording: boolean
  isPaused: boolean
  isSaving: boolean
}
export function RecordButton(props: RecordButtonProps) {
  const { onToggleRecording, isRecording, isPaused, isSaving } = props
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
          ${isRecording && !isPaused ? 'animate-pulse' : ''}`}
      />
      {isRecording ? 'Save Recording' : 'Record New Workflow'}
    </Button>
  )
}
