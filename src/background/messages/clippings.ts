// This fixes error from build for async message passing from bg to content script
import type { PlasmoMessaging } from '@plasmohq/messaging'
import { Storage } from '@plasmohq/storage'

import { STORAGE_KEY } from '~/lib/constants'
import * as api from '~/lib/api'

// just dummy handler does nothing

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log(444, req)

  const payload = req?.body

  if (!payload) {
    console.log('no data...')
    res.send('no data...')
    return
  }

  const newClipping = await saveClipping(payload)
  console.log('save 111', newClipping)
  res.send(newClipping)
}

export default handler

// iklcfefmepaoighpffiniigiehfcdihk

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
