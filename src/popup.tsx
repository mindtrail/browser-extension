// import { CountButton } from "~features/store-button"

import "~style.css"

document.addEventListener("DOMContentLoaded", function () {
  // This code runs when the popup is shown

  // Get the current tab
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var currentTab = tabs[0]

    // Execute the script to get the page content
    chrome.scripting.executeScript(
      {
        target: { tabId: currentTab.id },
        func: getPageContentSource
      },
      (results) => {
        // Handle the results of the script execution, if needed
        if (chrome.runtime.lastError) {
          // console.error(chrome.runtime.lastError)
        } else if (results && results.length) {
          // console.log(results[0].result)
        }
      }
    )
  })
})

function getPageContentSource() {
  return document.documentElement.outerHTML
}

function IndexPopup() {
  return (
    <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-h-96 plasmo-w-80">
      Helo
    </div>
  )
}

export default IndexPopup
