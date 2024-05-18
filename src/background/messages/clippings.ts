// This fixes error from build for async message passing from bg to content script
import type { PlasmoMessaging } from '@plasmohq/messaging'

// just dummy handler does nothing

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log(444, req)

  const message = 'success'
  res.send({
    message,
  })
}

export default handler

// iklcfefmepaoighpffiniigiehfcdihk
