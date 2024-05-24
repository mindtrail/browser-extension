import { useEffect, useState } from 'react'
import { getRecorderState, saveRecorderState } from '~lib/hooks/recorder-storage'
import { DEFAULT_RECORDER_STATE } from '~/lib/constants'

export const useRecorderState = () => {
  const [storageData, setStorageData] = useState(DEFAULT_RECORDER_STATE)
  const [isRecording, setIsRecording] = useState(DEFAULT_RECORDER_STATE.isRecording)
  const [eventsMap, setEventsMap] = useState(
    new Map(JSON.parse(DEFAULT_RECORDER_STATE.eventsMap)),
  )
  const [paused, setPaused] = useState(DEFAULT_RECORDER_STATE.paused)
  const [saving, setSaving] = useState(DEFAULT_RECORDER_STATE.saving)

  // Init: State -> Storage
  useEffect(() => {
    const fetchData = async () => {
      const data = await getRecorderState()
      setStorageData(data)
    }
    fetchData()
  }, [])

  // Sync: Storage -> State
  useEffect(() => {
    if (isRecording !== storageData.isRecording) {
      setIsRecording(storageData.isRecording)
    }
    if (eventsMap?.size !== new Map(JSON.parse(storageData.eventsMap)).size) {
      setEventsMap(new Map(JSON.parse(storageData.eventsMap)))
    }
    if (paused !== storageData.paused) {
      setPaused(storageData.paused)
    }
    if (saving !== storageData.saving) {
      setSaving(storageData.saving)
    }
  }, [storageData])

  // Sync: State -> Storage
  useEffect(() => {
    const updateStorage = async () => {
      if (
        isRecording !== storageData.isRecording ||
        eventsMap?.size !== new Map(JSON.parse(storageData.eventsMap)).size ||
        paused !== storageData.paused ||
        saving !== storageData.saving
      ) {
        await saveRecorderState({
          isRecording,
          eventsMap: JSON.stringify(Array.from(eventsMap.entries())),
          paused,
          saving,
          backgroundEvents: storageData.backgroundEvents,
        })
      }
    }
    updateStorage()
  }, [isRecording, eventsMap, paused, saving])

  return {
    isRecording,
    setIsRecording,
    eventsMap,
    setEventsMap,
    paused,
    setPaused,
    saving,
    setSaving,
  }
}
