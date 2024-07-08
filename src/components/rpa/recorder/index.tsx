import { Typography } from '~/components/typography'
import { useEventListeners } from '~/lib/hooks/use-events-listener'
import { useRecorderState } from '~/lib/hooks/use-recorder-state'
import { useAudioRecorder } from '~/lib/hooks/use-audio-recorder'

import { RecordButton } from './record-button'
import { RecordingEventsList } from '../events-list'
import { CancelRecordingButton } from './cancel-button'
import { PauseRecordingButton } from './pause-button'
import { RestartRecordingButton } from './restart-button'

function FlowRecorder() {
  const {
    eventsList,
    isRecording,
    isPaused,
    isSaving,
    resetRecorderState,
    deleteAllEvents,
    updateRecordedEvents,
    deleteEvent,
    toggleRecording,
    togglePause,
  } = useRecorderState()

  const { transcript, setTranscript } = useAudioRecorder(isRecording, isPaused)
  useEventListeners({ isRecording, isPaused, updateRecordedEvents, resetRecorderState })

  const restartRecording = () => {
    deleteAllEvents()
    setTranscript('')
  }

  if (!isRecording) return null

  return (
    <div
      className={`flex flex-col justify-end gap-4 py-2 px-4
        w-full absolute bottom-0 bg-slate-50 z-10
      `}
    >
      <div className='flex flex-col py-2 gap-4'>
        {!!transcript.length && (
          <Typography className='w-full'>
            {isPaused ? 'Recording paused' : transcript}
          </Typography>
        )}

        {!!eventsList?.length && (
          <div className='flex flex-col flex-1 justify-between h-full overflow-auto'>
            <RecordingEventsList eventsList={eventsList} deleteEvent={deleteEvent} />
          </div>
        )}
      </div>

      <RecordButton
        onToggleRecording={toggleRecording}
        isRecording={isRecording}
        isPaused={isPaused}
        isSaving={isSaving}
      />

      <div className='flex justify-between gap-4'>
        <PauseRecordingButton onPause={togglePause} isPaused={isPaused} />
        <RestartRecordingButton onRestart={restartRecording} />
        <CancelRecordingButton onCancel={resetRecorderState} />
      </div>
    </div>
  )
}

export { RecordButton, FlowRecorder }
