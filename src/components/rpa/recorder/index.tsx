import { Typography } from '~/components/typography'
import { useEventListeners } from '~/lib/hooks/use-events-listener'
import { useRecorderState } from '~/lib/hooks/use-recorder-state'
import { useAudioRecorder } from '~/lib/hooks/use-audio-recorder'

import { RecordButton } from './record-button'
import { EventsList } from '../events-list'
import { CancelRecordingButton } from './cancel-recording-button'

function FlowRecorder() {
  const {
    eventsList,
    isRecording,
    isPaused,
    isSaving,
    resetRecorderState,
    updateRecordedEvents,
    deleteEvent,
    toggleRecording,
    togglePause,
  } = useRecorderState()
  const { transcript } = useAudioRecorder(isRecording)

  console.log(111, isRecording)
  useEventListeners({ isRecording, isPaused, updateRecordedEvents, resetRecorderState })

  return (
    <div
      className={`${isRecording ? 'h-full' : 'h-auto'}
        flex flex-col justify-end gap-2 py-2 px-4
        w-full absolute bottom-0 border bg-slate-50 z-10
      `}
    >
      {isRecording && (
        <div className='flex flex-col flex-1 justify-between pt-2 h-full overflow-auto'>
          <CancelRecordingButton onClick={resetRecorderState} />
          <EventsList eventsList={eventsList} deleteEvent={deleteEvent} />
        </div>
      )}

      {isRecording && !eventsList?.length && (
        <Typography className='w-full text-center mb-6'>
          {isPaused
            ? 'Paused Recording'
            : !!transcript
            ? transcript
            : 'Recording Workflow...'}
        </Typography>
      )}

      <RecordButton
        onToggleRecording={toggleRecording}
        onPause={togglePause}
        isRecording={isRecording}
        isPaused={isPaused}
        isSaving={isSaving}
      />
    </div>
  )
}

export { RecordButton, FlowRecorder }
