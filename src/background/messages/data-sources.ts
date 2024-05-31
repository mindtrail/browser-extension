// This fixes error from build for async message passing from bg to content script
import type { PlasmoMessaging } from '@plasmohq/messaging'

import { MESSAGES, STORAGE_AREA } from '~/lib/constants'
import { getStorage } from '~/lib/storage'
import * as api from '~/background/lib/api'

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { type, payload } = req?.body

  if (!payload) {
    res.send('no data...')
    return
  }

  switch (type) {
    case MESSAGES.SAVE_PAGE:
      const newDS = await api.savePageAPICall(payload)
      fetchSavedDSList() // Update storage data after a new page added
      res.send(newDS)
      break
    default:
      break
  }
}

export default handler

export async function fetchSavedDSList() {
  const storage = await getStorage()
  const result = await api.fetchSavedDSListAPICall()

  if (result?.error) {
    await storage.set(STORAGE_AREA.SAVED_WEBSITES, [])
    return
  }

  await storage.set(STORAGE_AREA.SAVED_WEBSITES, result)
}
