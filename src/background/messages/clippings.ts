// This fixes error from build for async message passing from bg to content script
import type { PlasmoMessaging } from '@plasmohq/messaging'

import { MESSAGES, STORAGE_KEY } from '~/lib/constants'
import * as api from '~/lib/api'
import { getStorage } from '~/background/initialize'

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log(444, req)

  const { type, payload } = req?.body

  switch (type) {
    case MESSAGES.SAVE_CLIPPING:
      const newClipping = await saveClipping(payload)
      console.log('save 111', newClipping)
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

  if (!payload) {
    console.log('no data...')
    res.send('no data...')
    return
  }
}

export default handler

export const saveClipping = async (payload: SavedClipping) => {
  const { pageData, ...rest } = payload

  const { dataSource } = await api.savePageAPICall(pageData)
  console.log('dataSource', dataSource)

  if (!dataSource) {
    throw new Error('No dataSource', { cause: { error: 'No dataSource' } })
  }

  const saveClippingPayload = {
    ...rest,
    dataSourceId: dataSource.id,
  }

  console.log('payload', saveClippingPayload)

  const newClipping = await api.saveClippingAPICall(saveClippingPayload)
  console.log('newClipping', newClipping)

  return newClipping
}

export const fetchClippingList = async () => {
  try {
    const clippingList = await api.getClippingListAPICall()

    const clippingsMap = clippingList.reduce((acc: any, item: ClippingByDataSource) => {
      acc[item.dataSourceName] = item.clippingList
      return acc
    }, {})

    const storage = await getStorage()
    await storage.set(STORAGE_KEY.CLIPPINGS_BY_DS, clippingsMap)

    return clippingList
  } catch (error) {
    console.error('error Clippings', error, error?.cause)
    return []
  }
}

export const deleteClipping = async ({ clippingId }) => {
  const deletedClipping = await api.deleteClippingAPICall(clippingId)

  console.log('deleted Clipping', deletedClipping)
  return deletedClipping
}
