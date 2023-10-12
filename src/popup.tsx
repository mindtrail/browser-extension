// import { CountButton } from "~features/store-button"

import "~style.css"

import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"

function SwitchDemo() {
  return (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  )
}

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
    <div className="flex items-center justify-center h-96 w-80">
      Helo <SwitchDemo />
    </div>
  )
}

export default IndexPopup
