import { useEffect, useState, useCallback } from 'react'

const handleDataAvailable = (event: BlobEvent) => {
  console.log(123, event)
  // Process each chunk, e.g., send to backend
}

const handleStop = () => {
  // Finalize recording, e.g., close files, release resources
  console.log(3333, 'stoped')
}

export const useAudioRecorder = (isRecording) => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)

  useEffect(() => {
    if (isRecording) {
      startRecording()
    } else {
      stopRecording()
    }
  }, [isRecording])

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
    // Logic to start recording
  }, [])

  const stopRecording = useCallback(() => {
    if (!mediaRecorder) return
    console.log(222, mediaRecorder)

    mediaRecorder?.stop()
    setMediaRecorder(null)
  }, [mediaRecorder])

  return { mediaRecorder }
}
