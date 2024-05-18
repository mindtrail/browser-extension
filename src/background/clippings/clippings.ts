import { Storage } from '@plasmohq/storage'

import { STORAGE_KEY } from '~/lib/constants'
import * as api from '~/lib/api'

export const fetchClippingList = async (
  storage: Storage,
  sendResponse?: ContentScriptResponse,
) => {
  try {
    const clippingList = await api.getClippingListAPICall()

    const clippingsMap = clippingList.reduce((acc: any, item: ClippingByDataSource) => {
      acc[item.dataSourceName] = item.clippingList
      return acc
    }, {})

    await storage.set(STORAGE_KEY.CLIPPINGS_BY_DS, clippingsMap)

    if (sendResponse) {
      sendResponse(clippingList)
    }

    return clippingList
  } catch (error) {
    console.error('error Clippings', error, error?.cause)
    return []
  }
}

export const saveClipping = async (
  payload: SavedClipping,
  sendResponse: ContentScriptResponse,
) => {
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

  sendResponse(newClipping)
}

export const deleteClipping = async (
  { clippingId },
  sendResponse: ContentScriptResponse,
) => {
  const deletedClipping = await api.deleteClippingAPICall(clippingId)

  console.log('deleted Clipping', deletedClipping)
  sendResponse(deletedClipping)
}
