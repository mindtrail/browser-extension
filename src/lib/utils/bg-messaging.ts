import { sendToBackground } from '@plasmohq/messaging'

type Name = 'clippings' | 'flows'

type Message = {
  name: Name
  body: any
}

export const sendMessageToBg = async ({ name, body }: Message) =>
  await sendToBackground({
    name,
    body, // @TODO: test if the extensionId is actually needed.
    extensionId: 'iklcfefmepaoighpffiniigiehfcdihk',
  })
