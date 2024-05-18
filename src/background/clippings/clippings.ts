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
