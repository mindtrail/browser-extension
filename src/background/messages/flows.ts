// This fixes error from build for async message passing from bg to content script
import type { PlasmoMessaging } from '@plasmohq/messaging'

import { MESSAGES } from '~/lib/constants'
import { createFlow } from '~/lib/supabase'

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { type, payload } = req?.body

  if (!payload) {
    console.log('no data...')
    res.send('no data...')
    return
  }

  switch (type) {
    case MESSAGES.CREATE_FLOW:
      const newFlow = await createFlow(payload)
      res.send(newFlow)
      break
    default:
      break
  }
}

export default handler
