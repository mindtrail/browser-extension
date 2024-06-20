import { sendToBackground } from '@plasmohq/messaging'
import { MESSAGE_AREAS } from '~lib/constants'

type MessageName = MESSAGE_AREAS

type Message = {
  name: MessageName
  body?: any
}

export const sendMessageToBg = async ({ name, body }: Message) =>
  await sendToBackground({
    name,
    body, // @TODO: test if the extensionId is actually needed.
    extensionId: 'iklcfefmepaoighpffiniigiehfcdihk',
  })
