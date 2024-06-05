// This fixes error from build for async message passing from bg to content script
import type { PlasmoMessaging } from '@plasmohq/messaging'

import * as api from '~/background/lib/api'

interface SearchPayload {
  searchQuery: string
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { type, payload } = req?.body

  if (!payload) {
    console.log('no data...')
    res.send('no data...')
    return
  }
  console.log(111, payload)
  const websites = await api.searchHistoryAPICall(payload?.searchQuery)
  res.send(websites)
}

export default handler
