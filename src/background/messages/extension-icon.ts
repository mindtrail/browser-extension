// This fixes error from build for async message passing from bg to content script
import type { PlasmoMessaging } from '@plasmohq/messaging'
import { updateExtensionIcon } from '~/background/utils/update-icon'

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log(222, req)
  updateExtensionIcon()
}

export default handler
