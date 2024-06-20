import { Storage } from '@plasmohq/storage'
import { STORAGE_AREA, DEFAULT_RECORDER_STATE } from '~/lib/constants'
import { getStorage } from '~/lib/storage'

const { RECORDER } = STORAGE_AREA

let storage: Storage
getStorage().then((s) => (storage = s))

export const getRecorderState = async (): Promise<typeof DEFAULT_RECORDER_STATE> => {
  const recorderState: any = await storage.get(RECORDER)
  return recorderState || DEFAULT_RECORDER_STATE
}

export const setRecorderState = async (newState: typeof DEFAULT_RECORDER_STATE) => {
  await storage.set(RECORDER, newState)
  return newState
}

export const watchRecorderState = () => {
  storage.watch({
    [RECORDER]: (changes) => {
      // console.log(changes)
      // callback(changes.newValue, changes.oldValue),
    },
  })
}
