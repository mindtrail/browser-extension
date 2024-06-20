import { useEffect, useState, useCallback } from 'react'
import { createClient, LiveTranscriptionEvents, LiveClient } from '@deepgram/sdk'

const DEEPGRAM_API_KEY = process.env.PLASMO_PUBLIC_DEEPGRAM_KEY
let mediaRecorder: MediaRecorder | null = null
let deepgramConnection: LiveClient | null = null

const initDeepgram = async (setTranscript) => {
  // STEP 1: Create a Deepgram client using the API key
  const deepgram = createClient(DEEPGRAM_API_KEY)

  // STEP 2: Create a live transcription connection
  const connection = deepgram.listen.live({
    model: 'nova-2',
    language: 'en-US',
    smart_format: true,
  })

  // STEP 3: Listen for events from the live transcription connection
  connection.on(LiveTranscriptionEvents.Open, () => {
    connection.keepAlive()

    connection.on(LiveTranscriptionEvents.Close, () => {
      console.log('Connection closed.')
    })

    connection.on(LiveTranscriptionEvents.Transcript, (data) => {
      console.log(data.channel.alternatives[0].transcript)
      setTranscript((prev) => prev + ' ' + data.channel.alternatives[0].transcript)
    })

    connection.on(LiveTranscriptionEvents.Metadata, (data) => {
      console.log('metadata', data)
    })

    connection.on(LiveTranscriptionEvents.Error, (err) => {
      console.error('error', err)
    })
  })

  return connection
}

const handleDataAvailable = async (event: BlobEvent) => {
  // @TODO: Process each chunk, i.e. stream to backend
  const { data } = event
  const arrayBuffer = await data.arrayBuffer()
  deepgramConnection.send(arrayBuffer)
}

const handleStop = () => {
  console.log('Recording stopped')
  // Delay the stream close to make sure all data available events are processed
  setTimeout(() => {
    deepgramConnection?.finish()
    deepgramConnection = null
  }, 1000)
}

export const useAudioRecorder = (isRecording) => {
  const [error, setError] = useState<string | null>(null)
  const [transcript, setTranscript] = useState<string>('')

  const startRecording = useCallback(async () => {
    try {
      deepgramConnection = await initDeepgram(setTranscript)

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

  return { transcript, error }
}
