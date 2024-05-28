import { useEffect, useState, useCallback, useMemo } from 'react'
import { useStorage } from '@plasmohq/storage/hook'
import { Storage } from '@plasmohq/storage'

import { STORAGE_AREA, DEFAULT_RECORDER_STATE } from '~/lib/constants'

const RECORDER_CONFIG = {
  key: STORAGE_AREA.RECORDER,
  instance: new Storage({ area: 'local' }), // Use localStorage instead of sync
}

export const useRecorderState = () => {
  const [storageData, setStorageData] = useStorage(
    RECORDER_CONFIG,
    DEFAULT_RECORDER_STATE,
  )
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)

  // Parse only once and memoize
  const eventsMapFromStorage = useMemo(
    () => new Map(JSON.parse(storageData.eventsMap || '[]')),
    [storageData.eventsMap],
  )

  const [recorderState, setRecorderState] = useState({
    isRecording: storageData.isRecording,
    eventsMap: eventsMapFromStorage,
    isPaused: storageData.isPaused,
    isSaving: storageData.isSaving,
  })

  console.log(1234, recorderState)

  // // Handle state updates from storage changes
  useEffect(() => {
    setRecorderState((prev) => ({
      ...prev,
      isRecording: storageData.isRecording,
      eventsMap: eventsMapFromStorage,
      isPaused: storageData.isPaused,
      isSaving: storageData.isSaving,
    }))
  }, [storageData, eventsMapFromStorage])

  // Sync state back to storage
  // useEffect(() => {
  //   // @ts-ignore
  //   if (state !== storageData) {
  //     setStorageData({
  //       isRecording: state.isRecording,
  //       eventsMap: JSON.stringify(Array.from(state.eventsMap.entries())),
  //       isPaused: state.isPaused,
  //       saving: state.saving,
  //     })
  //   }
  // }, [state])

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

  useEffect(() => {
    if (recorderState.isRecording) {
      // startRecording()
    } else {
      // stopRecording()
    }
  }, [recorderState.isRecording, startRecording, stopRecording])

  return { ...recorderState, setRecorderState }
}
