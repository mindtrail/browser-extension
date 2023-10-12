// import { CountButton } from "~features/store-button"

import "~style.css"

import { useEffect, useState } from "react"

import { Settings } from "~/components/settings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"

const defaultTab = "settings"

function getPageContentSource() {
  return document.documentElement.outerHTML
}

function IndexPopup() {
  useEffect(() => {}, [])

  return (
    <div className="flex h-96 w-80">
      <Tabs defaultValue={defaultTab} className="flex flex-col w-full text-">
        <TabsList className="flex w-full relative justify-between border-b bg-inherit rounded-none">
          <TabsTrigger value="search">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="files" className="px-4 py-4"></TabsContent>
        <TabsContent value="settings">
          <Settings />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default IndexPopup

// chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//   var currentTab = tabs[0]

//   // Execute the script to get the page content
//   chrome.scripting.executeScript(
//     {
//       target: { tabId: currentTab.id },
//       func: getPageContentSource
//     },
//     (results) => {
//       // Handle the results of the script execution, if needed
//       if (chrome.runtime.lastError) {
//         // console.error(chrome.runtime.lastError)
//       } else if (results && results.length) {
//         // console.log(results[0].result)
//       }
//     }
//   )
// })
