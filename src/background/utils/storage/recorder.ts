import { Storage } from '@plasmohq/storage'
import { STORAGE_AREA, DEFAULT_RECORDER_STATE } from '~/lib/constants'
import { getStorage } from '~lib/storage'

let storage: Storage
let recorderState = DEFAULT_RECORDER_STATE
const { RECORDER } = STORAGE_AREA

getStorage().then((s) => (storage = s))

export const getRecorderState = async () => {
  const storedData: any = await storage.get(RECORDER)
  recorderState = storedData || DEFAULT_RECORDER_STATE

  return recorderState
}

export const setRecorderState = async (newState) => {
  await storage.set(RECORDER, newState)
  return newState
}

export const watchRecorderState = (callback) => {
  storage.watch({
    [RECORDER]: (changes) => callback(changes.newValue, changes.oldValue),
  })
}
