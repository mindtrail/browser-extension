import { Storage } from '@plasmohq/storage'
import { STORAGE_AREA, DEFAULT_RECORDER_STATE } from '~/lib/constants'

const RECORDER_CONFIG = {
  key: STORAGE_AREA.RECORDER,
  instance: new Storage({ area: 'local' }),
}

let storageData = DEFAULT_RECORDER_STATE

const getState = async () => {
  const storedData: any = await RECORDER_CONFIG.instance.get(RECORDER_CONFIG.key)
  storageData = storedData || DEFAULT_RECORDER_STATE
  return storageData
}

const saveState = async (newState) => {
  storageData = { ...storageData, ...newState }
  await RECORDER_CONFIG.instance.set(RECORDER_CONFIG.key, storageData)
  return storageData
}

const watchState = (callback) => {
  RECORDER_CONFIG.instance.watch({
    [RECORDER_CONFIG.key]: (changes) => callback(changes.newValue, changes.oldValue),
  })
}

const createBackgroundEvent = async (event) => {
  storageData.backgroundEvents = storageData.backgroundEvents || []
  storageData.backgroundEvents = [...storageData.backgroundEvents, event]
  await RECORDER_CONFIG.instance.set(RECORDER_CONFIG.key, storageData)
  return event
}

const onBackgroundEvent = (callback) => {
  RECORDER_CONFIG.instance.watch({
    [RECORDER_CONFIG.key]: (changes) => {
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

export { getState, saveState, watchState, createBackgroundEvent, onBackgroundEvent }
