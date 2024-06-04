export async function startRecording(setMediaRecorder) {
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
}

export const handleDataAvailable = (event: BlobEvent) => {
  console.log(123, event)
  // Process each chunk, e.g., send to backend
}

export const handleStop = () => {
  // Finalize recording, e.g., close files, release resources
}

export const stopRecording = (setMediaRecorder, mediaRecorder) => {
  mediaRecorder?.stop()
  setMediaRecorder(null)
}
