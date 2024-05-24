import { useEffect, useState } from 'react'
import { useStorage } from '@plasmohq/storage/hook'
import { DEFAULT_RECORDER_STATE } from '~/lib/constants'
import { RECORDER_CONFIG } from '~/lib/hooks/recorder-storage'

export const useRecorderState = () => {
  const [storageData, setStorageData] = useStorage(
    RECORDER_CONFIG,
    DEFAULT_RECORDER_STATE,
  )
  const [isRecording, setIsRecording] = useState(storageData.isRecording)
  const [eventsMap, setEventsMap] = useState(new Map(JSON.parse(storageData.eventsMap)))
  const [paused, setPaused] = useState(storageData.paused)
  const [saving, setSaving] = useState(storageData.saving)

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
    if (
      isRecording !== storageData.isRecording ||
      eventsMap?.size !== new Map(JSON.parse(storageData.eventsMap)).size ||
      paused !== storageData.paused ||
      saving !== storageData.saving
    ) {
      setStorageData({
        isRecording,
        eventsMap: JSON.stringify(Array.from(eventsMap.entries())),
        paused,
        saving,
        backgroundEvents: storageData.backgroundEvents,
      })
    }
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
