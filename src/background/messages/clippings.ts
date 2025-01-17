// This fixes error from build for async message passing from bg to content script
import type { PlasmoMessaging } from '@plasmohq/messaging'

import { MESSAGES, STORAGE_AREA } from '~/lib/constants'
import * as api from '~background/lib/api'
import { getStorage } from '~/lib/storage'

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { type, payload } = req?.body

  if (!payload) {
    console.log('no data...')
    res.send('no data...')
    return
  }

  switch (type) {
    case MESSAGES.SAVE_CLIPPING:
      const newClipping = await saveClipping(payload)
      fetchClippingList() // Update storage data afeter a new item added
      // fetchSavedDSList() // Update storage data after a new page added
      res.send(newClipping)
      break
    case MESSAGES.DELETE_CLIPPING:
      const deletedClipping = await deleteClipping(payload)
      fetchClippingList() // Update storage data after a delete
      res.send(deletedClipping)
      break
    default:
      break
  }
}

export default handler

export const saveClipping = async (payload: SavedClipping) => {
  const { pageData, ...rest } = payload
  const { dataSource, error } = await api.savePageAPICall(pageData)

  if (error || !dataSource) {
    return { error }
  }

  const saveClippingPayload = {
    ...rest,
    dataSourceId: dataSource.id,
  }

  const newClipping = await api.saveClippingAPICall(saveClippingPayload)

  return newClipping
}

export const fetchClippingList = async () => {
  const result = (await api.getClippingListAPICall()) || []

  if (result?.error) {
    return []
  }

  const clippingsMap = result?.reduce((acc: any, item: ClippingByDataSource) => {
    acc[item.dataSourceName] = item.clippingList
    return acc
  }, {})

  const storage = await getStorage()
  await storage.set(STORAGE_AREA.CLIPPINGS_BY_DS, clippingsMap)

  return result
}

export const deleteClipping = async ({ clippingId }) => {
  const deletedClipping = await api.deleteClippingAPICall(clippingId)

  console.log('deleted Clipping', deletedClipping)
  return deletedClipping
}
