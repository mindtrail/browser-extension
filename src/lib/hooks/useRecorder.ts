import { useEffect, useState } from 'react'
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

  const [isRecording, setIsRecording] = useState(storageData.isRecording)
  const [eventsMap, setEventsMap] = useState(storageData.eventsMap)
  const [paused, setPaused] = useState(storageData.paused)
  const [saving, setSaving] = useState(storageData.saving)

  // Effect to update local state when storageData changes
  useEffect(() => {
    if (isRecording !== storageData.isRecording) {
      setIsRecording(storageData.isRecording)
    }
    if (eventsMap?.size !== storageData.eventsMap?.size) {
      setEventsMap(storageData.eventsMap)
    }
    if (paused !== storageData.paused) {
      setPaused(storageData.paused)
    }
    if (saving !== storageData.saving) {
      setSaving(storageData.saving)
    }
  }, [storageData])

  useEffect(() => {
    // Check if the current state differs from the storage state before updating
    if (
      isRecording !== storageData.isRecording ||
      eventsMap?.size !== storageData.eventsMap?.size ||
      paused !== storageData.paused ||
      saving !== storageData.saving
    ) {
      setStorageData({ isRecording, eventsMap, paused, saving })
    }
  }, [isRecording, eventsMap, paused, saving])

  console.log(isRecording)
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
