import { useState, useCallback, useMemo } from 'react'
import { useStorage } from '@plasmohq/storage/hook'
import { Storage } from '@plasmohq/storage'

import { STORAGE_AREA, DEFAULT_RECORDER_STATE } from '~/lib/constants'

const RECORDER_CONFIG = {
  key: STORAGE_AREA.RECORDER,
  instance: new Storage({ area: 'local' }), // Use localStorage instead of sync
}

export const useRecorderState = () => {
  const [recorderState, setRecorderState] = useStorage(
    RECORDER_CONFIG,
    () => DEFAULT_RECORDER_STATE,
  )
  const resetRecorderState = useCallback(
    () => setRecorderState(DEFAULT_RECORDER_STATE),
    [],
  )

  console.log(111, recorderState)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)

  // Parse only once and memoize
  // Handle state updates from storage changes. This works across tabs & on refresh
  // useEffect(() => {
  //   setRecorderState(() => ({
  //     isRecording: recorderState.isRecording,
  //     eventsMap: eventsMap,
  //     isPaused: recorderState.isPaused,
  //     isSaving: recorderState.isSaving,
  //   }))
  // }, [recorderState, eventsMap])

  // Sync state back to storage
  // useEffect(() => {
  //   // @ts-ignore
  //   console.log(1234, recorderState, recorderState)
  //   // To refactor this...
  //   if (recorderState?.isRecording !== recorderState.isRecording) {
  //     setRecorderState({
  //       isRecording: recorderState.isRecording,
  //       eventsMap: JSON.stringify(Array.from(recorderState.eventsMap.entries())),
  //       isPaused: recorderState.isPaused,
  //       isSaving: recorderState.isSaving,
  //     })
  //   }
  // }, [recorderState, setRecorderState])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const newRecorder = new MediaRecorder(stream)

      newRecorder.ondataavailable = handleDataAvailable
      newRecorder.onstop = handleStop
      newRecorder.start(1000)
      setMediaRecorder(newRecorder)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }, [])

  const stopRecording = useCallback(() => {
    mediaRecorder?.stop()
    setMediaRecorder(null)
  }, [mediaRecorder])

  const handleDataAvailable = useCallback((event: BlobEvent) => {
    // Process each chunk, e.g., send to backend
  }, [])

  const handleStop = useCallback(() => {
    // Finalize recording, e.g., close files, release resources
  }, [])

  // useEffect(() => {
  //   if (recorderState.isRecording) {
  //     // startRecording()
  //   } else {
  //     // stopRecording()
  //   }
  // }, [recorderState.isRecording, startRecording, stopRecording])

  return {
    ...recorderState,
    resetRecorderState,
    setRecorderState,
  }
}

export function deserializeEventsMap(eventsMap: string = '[]') {
  return new Map(JSON.parse(eventsMap))
}

export function serializeEventsMap(eventsMap: Map<string, Event[]>) {
  return JSON.stringify(Array.from(eventsMap.entries()))
}
