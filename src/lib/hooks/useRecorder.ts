import { useEffect, useState, useCallback } from 'react'
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
    DEFAULT_RECORDER_STATE,
  )

  const resetRecorderState = useCallback(
    () => setRecorderState(DEFAULT_RECORDER_STATE),
    [],
  )

  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)

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

  return {
    ...recorderState,
    resetRecorderState,
    setRecorderState,
  }
}
