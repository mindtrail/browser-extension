import { useEffect, useState, useCallback } from 'react'

const handleDataAvailable = (event: BlobEvent) => {
  console.log(123)
  // Process each chunk, e.g., send to backend
}

const handleStop = () => {
  console.log(3333, 'stopped')
}

export const useAudioRecorder = (isRecording) => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const newRecorder = new MediaRecorder(stream)

      newRecorder.ondataavailable = handleDataAvailable
      newRecorder.onstop = handleStop
      newRecorder.start(1000)
      setMediaRecorder(newRecorder)
      setError(null)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      setError('Error accessing microphone')
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (!mediaRecorder) return
    console.log(222, mediaRecorder)

    mediaRecorder.stop()
    mediaRecorder.stream.getTracks().forEach((track) => track.stop())
    setMediaRecorder(null)
  }, [isRecording])

  useEffect(() => {
    if (isRecording) {
      console.log(111)
      startRecording()
    } else {
      stopRecording()
    }

    return () => stopRecording()
  }, [isRecording, startRecording, stopRecording])

  return { mediaRecorder, error }
}
