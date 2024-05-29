import { Storage } from '@plasmohq/storage'
import { STORAGE_AREA, DEFAULT_RECORDER_STATE } from '~/lib/constants'
import { getStorage } from '~/lib/storage'

let storage: Storage
let recorderState = DEFAULT_RECORDER_STATE
const { RECORDER } = STORAGE_AREA

getStorage().then((s) => (storage = s))

export const getRecorderState = async (): Promise<typeof DEFAULT_RECORDER_STATE> => {
  const recorderState: any = await storage.get(RECORDER)
  return recorderState || DEFAULT_RECORDER_STATE
}

export const setRecorderState = async (newState: typeof DEFAULT_RECORDER_STATE) => {
  console.log(222, newState)
  await storage.set(RECORDER, newState)
  return newState
}

export const watchRecorderState = (callback) => {
  storage.watch({
    [RECORDER]: (changes) => {
      console.log(changes)
      // callback(changes.newValue, changes.oldValue),
    },
  })
}
