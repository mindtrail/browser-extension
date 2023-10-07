export {}

console.log(
  "Live now; make now always the most precious time. Now will never come again."
)

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension"
  )
  console.log(request)

  fetch("https://app-chat-jgnk6lxbhq-ey.a.run.app/api/embed", {
    method: "POST",
    body: JSON.stringify(request.payload),
    headers: {
      "Content-Type": "application/json"
    }
  })

  if (request.greeting === "hello") sendResponse({ farewell: "goodbye 123" })
})
