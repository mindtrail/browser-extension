// import { CountButton } from "~features/store-button"

import '~style.css'

import { useCallback } from 'react'

import { useStorage } from '@plasmohq/storage/hook'

import { Search } from '~/components/search'
import { Settings } from '~/components/settings'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { AUTO_SAVE_DELAY, DEFAULT_EXCLUDE_LIST } from '~/lib/constants'

const DEFAULT_TAB = 'search'

const defaultSettings: StorageData = {
  autoSave: true,
  saveDelay: AUTO_SAVE_DELAY,
  excludeList: DEFAULT_EXCLUDE_LIST,
}

function IndexPopup() {
  const [settings, setSettings] = useStorage('settings', defaultSettings)

  const updatedSettings = useCallback((newSettings: Partial<StorageData>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }, [])

  return (
    <div className="flex h-[500px] w-96">
      <Tabs defaultValue={DEFAULT_TAB} className="flex flex-col w-full text-">
        <TabsList className="flex w-full relative justify-between border-b bg-inherit rounded-none">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="search">
          <Search />
        </TabsContent>
        <TabsContent value="settings">
          <Settings {...settings} updateSettings={updatedSettings} />
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
