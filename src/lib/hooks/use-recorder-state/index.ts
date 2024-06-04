import { useEffect, useState, useCallback } from 'react'
import { Storage } from '@plasmohq/storage'
import { useStorage } from '@plasmohq/storage/hook'

import { STORAGE_AREA, DEFAULT_RECORDER_STATE } from '~/lib/constants'
import {
  updateRecordedEvents,
  deleteEvent,
  togglePause,
  toggleRecording,
} from './recorder-event-handlers'

import { startRecording, stopRecording } from './audio-events'

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
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)

  useEffect(() => {
    if (recorderState.isRecording) {
      startRecording(setMediaRecorder)
    } else {
      stopRecording(setMediaRecorder, mediaRecorder)
    }
  }, [recorderState.isRecording, startRecording, stopRecording])

  const baseState = { ...recorderState, resetRecorderState, setRecorderState }
  return {
    ...baseState,
    updateRecordedEvents: (args) => updateRecordedEvents(args, setRecorderState),
    deleteEvent: (args) => deleteEvent(args, setRecorderState),
    toggleRecording: () => toggleRecording(baseState),
    togglePause: () => togglePause(setRecorderState),
  }
}
