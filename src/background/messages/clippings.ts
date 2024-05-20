// This fixes error from build for async message passing from bg to content script
import type { PlasmoMessaging } from '@plasmohq/messaging'

// just dummy handler does nothing
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {}

export default handler
