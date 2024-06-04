import { useEffect } from 'react'
import { LoaderCircleIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Typography } from '~components/typography'
import { useRecorderState } from '~lib/hooks/use-recorder-state'
import {
  listenEventsToRecord,
  listenEventsForUIState,
} from '~lib/utils/recorder/listen-events'
import {
  updateRecordedEvents,
  deleteEvent,
  toggleRecording,
  togglePause,
} from '~lib/hooks/use-recorder-events'

import { EventsList } from '../events-list'
import { CancelRecordingButton } from './cancel-recording-button'
import { RecordButton } from './record-button'

export function FlowRecorder() {
  const { isRecording, isPaused, isSaving, eventsList, resetRecorderState } =
    useRecorderState()

  useEffect(() => {
    const shouldListen = isRecording && !isPaused
    if (!shouldListen) return

    const recordingCleanup = listenEventsToRecord(updateRecordedEvents)
    const uiStateCleanup = listenEventsForUIState(resetRecorderState)

    return () => {
      recordingCleanup()
      uiStateCleanup()
    }
  }, [isRecording, isPaused])

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
          {isPaused ? 'isPaused Recording' : 'Recording Workflow...'}
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
