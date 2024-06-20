import { Storage } from '@plasmohq/storage'

let storage: Storage

export const getStorage = async (): Promise<Storage> => {
  if (!storage) {
    storage = new Storage({ area: 'local' })
  }

  return storage
}
