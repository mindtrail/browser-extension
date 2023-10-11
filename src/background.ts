import { MESSAGES } from "~utils/constants"

const LOCAL_URL = "http://localhost:3000/api/embed/html"
const REMOTE_URL = "https://app-chat-jgnk6lxbhq-ey.a.run.app/api/embed/html"

const NODE_ENV = process.env.NODE_ENV

const EMBEDDING_URL = NODE_ENV === "development" ? LOCAL_URL : REMOTE_URL

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { message, payload } = request

  console.log(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension"
  )

  if (message === MESSAGES.USER_TRIGGERED_SAVE) {
    callEmbeddingEndpoint(payload, sendResponse)
  }

  if (message === MESSAGES.AUTO_SAVE) {
    callEmbeddingEndpoint(payload, sendResponse)
  }

  return true
})

async function callEmbeddingEndpoint(payload, sendResponse) {
  try {
    const result = await fetch(EMBEDDING_URL, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json"
      }
    })
    sendResponse({ farewell: "goodbye 123" })
    console.log(await result.json())
  } catch (e) {
    console.error(e)
  }
}
