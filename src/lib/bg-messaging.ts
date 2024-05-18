import { sendToBackground } from '@plasmohq/messaging'

type Name = 'clippings'

type Message = {
  name: Name
  body: any
}

export const sendMessageToBg = async ({ name, body }: Message) =>
  await sendToBackground({
    name,
    body,
    // extensionId: 'iklcfefmepaoighpffiniigiehfcdihk',
  })
