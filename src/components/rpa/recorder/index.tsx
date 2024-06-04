import { LoaderCircleIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Typography } from '~components/typography'
import { useEventListeners } from '~lib/utils/recorder/listen-events'
import { useRecorderState } from '~lib/hooks/use-recorder-state'
import { useAudioRecorder } from '~lib/hooks/use-audio-recorder'

import { EventsList } from '../events-list'
import { CancelRecordingButton } from './cancel-recording-button'
import { RecordButton } from './record-button'

export function FlowRecorder() {
  const {
    isRecording,
    isPaused,
    isSaving,
    eventsList,
    resetRecorderState,
    updateRecordedEvents,
    deleteEvent,
    toggleRecording,
    togglePause,
  } = useRecorderState()

  useEventListeners({ isRecording, isPaused, updateRecordedEvents, resetRecorderState })
  useAudioRecorder(isRecording)

  return (
    <div
      className={`${isRecording ? 'h-[calc(100%-52px)]' : 'h-auto'}
        flex flex-col justify-end gap-2 px-4 py-2
        w-full absolute bottom-0 border bg-slate-50`}
    >
      {isRecording && (
        <div className='flex flex-col flex-1 justify-between pt-2 h-full overflow-auto'>
          <CancelRecordingButton onClick={resetRecorderState} />
          <EventsList eventsList={eventsList} deleteEvent={deleteEvent} />
        </div>
      )}

      {isRecording && !eventsList?.length && (
        <Typography className='w-full text-center mb-6'>
          {isPaused ? 'Paused Recording' : 'Recording Workflow...'}
        </Typography>
      )}

      {isSaving ? (
        <Button
          className='flex w-full gap-4 items-center !opacity-75'
          variant='outline'
          disabled
        >
          <LoaderCircleIcon className='w-5 h-5 animate-spin' />
          <Typography>Saving Workflow...</Typography>
        </Button>
      ) : (
        <RecordButton
          onToggleRecording={toggleRecording}
          onPause={togglePause}
          isRecording={isRecording}
          isPaused={isPaused}
        />
      )}
    </div>
  )
}
