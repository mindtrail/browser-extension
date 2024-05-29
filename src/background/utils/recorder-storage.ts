import { STORAGE_AREA, DEFAULT_RECORDER_STATE } from '~/lib/constants'
import { getStorage } from '~background/utils/initialize'

let storage
let storageData = DEFAULT_RECORDER_STATE
getStorage().then((s) => (storage = s))

export const getRecorderState = async () => {
  const storedData: any = await storage.get(STORAGE_AREA.RECORDER)
  storageData = storedData || DEFAULT_RECORDER_STATE
  return storageData
}

export const saveRecorderState = async (newState) => {
  storageData = { ...storageData, ...newState }
  await storage.set(STORAGE_AREA.RECORDER, storageData)
  return storageData
}

export const watchRecorderState = (callback) => {
  storage.watch({
    [STORAGE_AREA.RECORDER]: (changes) => callback(changes.newValue, changes.oldValue),
  })
}

export const createBackgroundEvent = async (event) => {
  storageData.backgroundEvents = storageData.backgroundEvents || []
  storageData.backgroundEvents = [...storageData.backgroundEvents, event]
  await storage.set(STORAGE_AREA.RECORDER, storageData)
  return event
}

export const onBackgroundEvent = (callback) => {
  storage.watch({
    [STORAGE_AREA.RECORDER]: (changes) => {
      const oldBackgroundEvents = changes.oldValue.backgroundEvents || []
      const newBackgroundEvents = changes.newValue.backgroundEvents || []
      if (newBackgroundEvents.length <= oldBackgroundEvents.length) return
      const newEvents = newBackgroundEvents.slice(oldBackgroundEvents.length)
      newEvents.forEach((event) => {
        callback({ type: event.type, ...event.data })
      })
    },
  })
}
