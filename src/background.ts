export {}

const LOCAL_URL = "http://localhost:3000/api/embed/html"
const REMOTE_URL = "https://app-chat-jgnk6lxbhq-ey.a.run.app/api/embed/html"

const NODE_ENV = process.env.NODE_ENV

const EMBEDDING_URL = NODE_ENV === "development" ? LOCAL_URL : REMOTE_URL

chrome.action.onClicked.addListener((tab) => {
  // You can access tab.url, tab.title, etc. here
  // This is the code that will be executed when the user clicks on the extension icon
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: getPageContent
    },
    (results) => {
      // Handle the results of the script execution, if needed
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError)
      } else if (results && results.length) {
        console.log(results[0].result)
      }
    }
  )
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension"
  )
  console.log(request)

  callEmbeddingEndpoint(request.payload, sendResponse)
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
    console.log(e)
  }
}

function getPageContent() {
  console.log(666666)
  // Here, you can access the page DOM and retrieve data
  // For this example, I'll just retrieve the entire page's HTML
  let pageHTML = document.documentElement.outerHTML

  // You can save or send this data wherever you want
  // For now, let's just log it
  console.log(pageHTML)

  // You can also return some data if you want
  return pageHTML
}
