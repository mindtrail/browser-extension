// import { CountButton } from "~features/store-button"
import '~style.css'

import { Settings } from '~/components/settings'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
// import { Search } from '~/components/search'
// import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'

const DEFAULT_TAB = 'settings'

function IndexPopup() {
  return (
    <div className='flex h-[500px] w-96'>
      <Tabs defaultValue={DEFAULT_TAB} className='flex flex-col w-full'>
        <TabsList className='flex w-full relative justify-between border-b bg-inherit rounded-none'>
          {/* <TabsTrigger disabled value='search'>
            Search
          </TabsTrigger> */}

          <TabsTrigger value='settings'>Mindtrail Settings</TabsTrigger>
        </TabsList>
        {/* <TabsContent value='search'>
          <Search />
        </TabsContent> */}
        <TabsContent value='settings'>
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
