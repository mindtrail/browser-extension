import { useEffect, useState, useCallback } from 'react'

const handleDataAvailable = (event: BlobEvent) => {
  // @TODO: Process each chunk, i.e. stream to backend
  console.log(123, event)
}

const handleStop = () => {
  console.log('Recording stopped')
}

let mediaRecorder: MediaRecorder | null = null

export const useAudioRecorder = (isRecording) => {
  const [error, setError] = useState<string | null>(null)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const newRecorder = new MediaRecorder(stream)

      newRecorder.ondataavailable = handleDataAvailable
      newRecorder.onstop = handleStop
      newRecorder.start(1000)
      mediaRecorder = newRecorder
      setError(null)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      setError('Error accessing microphone')
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (!mediaRecorder) return

    mediaRecorder.stop()
    mediaRecorder.stream.getTracks().forEach((track) => track.stop())
    mediaRecorder = null
  }, [])

  useEffect(() => {
    if (isRecording) {
      startRecording()
    } else {
      stopRecording()
    }

    return () => stopRecording()
  }, [isRecording, startRecording, stopRecording])

  return { mediaRecorder, error }
}
