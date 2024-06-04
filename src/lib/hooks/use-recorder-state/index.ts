import { useCallback, useMemo } from 'react'
import { Storage } from '@plasmohq/storage'
import { useStorage } from '@plasmohq/storage/hook'

import { STORAGE_AREA, DEFAULT_RECORDER_STATE } from '~/lib/constants'
import {
  updateRecordedEvents,
  deleteEvent,
  togglePause,
  toggleRecording,
} from './recorder-event-handlers'

const RECORDER_CONFIG = {
  key: STORAGE_AREA.RECORDER,
  instance: new Storage({ area: 'local' }),
}

export const useRecorderState = () => {
  const [recorderState, setRecorderState] = useStorage(
    RECORDER_CONFIG,
    DEFAULT_RECORDER_STATE,
  )

  const resetRecorderState = useCallback(
    () => setRecorderState(DEFAULT_RECORDER_STATE),
    [],
  )

  const baseState = { ...recorderState, resetRecorderState, setRecorderState }
  const handlers = useMemo(
    () => ({
      updateRecordedEvents: (args) => updateRecordedEvents(args, setRecorderState),
      deleteEvent: (args) => deleteEvent(args, setRecorderState),
      toggleRecording: () => toggleRecording(baseState),
      togglePause: () => togglePause(setRecorderState),
    }),
    [recorderState, setRecorderState, resetRecorderState],
  )

  return {
    ...baseState,
    ...handlers,
  }
}
