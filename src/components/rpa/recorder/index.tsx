import { Typography } from '~/components/typography'
import { useEventListeners } from '~/lib/hooks/use-events-listener'
import { useRecorderState } from '~/lib/hooks/use-recorder-state'
import { useAudioRecorder } from '~/lib/hooks/use-audio-recorder'

import { RecordButton } from './record-button'
import { EventsList } from '../events-list'
import { CancelRecordingButton } from './cancel-button'
import { PauseRecordingButton } from './pause-button'
import { RestartRecordingButton } from './restart-button'
import { useCallback } from 'react'

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

  const restartRecording = useCallback(() => {
    deleteAllEvents()
    togglePause()
    setTranscript('')
  }, [])

  if (!isRecording) return null

  return (
    <div
      className={`${isRecording ? 'h-full' : 'h-auto'}
        flex flex-col justify-end gap-2 py-2 px-4
        w-full absolute bottom-0 border bg-slate-50 z-10
      `}
    >
      {isRecording && (
        <div className='flex flex-col flex-1 justify-between pt-2 h-full overflow-auto'>
          <div className='flex justify-between gap-4'>
            <PauseRecordingButton onPause={togglePause} isPaused={isPaused} />
            <RestartRecordingButton onRestart={restartRecording} />
            <CancelRecordingButton onCancel={resetRecorderState} />
          </div>
          <EventsList eventsList={eventsList} deleteEvent={deleteEvent} />
        </div>
      )}

      {isRecording && !eventsList?.length && (
        <Typography className='w-full text-center mb-6'>
          {isPaused ? 'Recording paused' : !!transcript && transcript}
        </Typography>
      )}

      <RecordButton
        onToggleRecording={toggleRecording}
        isRecording={isRecording}
        isPaused={isPaused}
        isSaving={isSaving}
      />
    </div>
  )
}

export { RecordButton, FlowRecorder }
