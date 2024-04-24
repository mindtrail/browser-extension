import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { Storage } from '@plasmohq/storage'
import { useStorage } from '@plasmohq/storage/hook'
import { XIcon, CheckIcon } from 'lucide-react'

import { getPageData } from '~/lib/page-data'
import { Button } from '~/components/ui/button'
import { Typography } from '~components/typography'

import { MESSAGES, STORAGE_KEY } from '~/lib/constants'

interface SidebarProps {
  settings: SettingsStored
  setSettings: Dispatch<SetStateAction<SettingsStored>>
}

const SAVED_WEBSITES_CONFIG = {
  key: STORAGE_KEY.SAVED_WEBSITES,
  instance: new Storage({ area: 'local' }), // Use localStorage instead of sync
}

export const RightSidebar = ({ setSettings }: SidebarProps) => {
  const [savedWebsites, setSavedWebsites] = useStorage(SAVED_WEBSITES_CONFIG, [])
  const [loading, toggleLoading] = useReducer((c) => !c, false)
  const [isSidebarOpen, toggleSidebar] = useReducer((c) => !c, false)

  const handlePageSave = useCallback(async () => {
    toggleLoading()
    const payload = getPageData()

    const result = await chrome.runtime.sendMessage({
      message: MESSAGES.SAVE_PAGE,
      payload,
    })

    toggleLoading()

    if (result?.error) {
      const { message, status } = result.error

      alert(`${status}: ${message}`) // TODO: use toast (status message)
      console.error(`${status}: ${message}`)
      return
    }

    setSavedWebsites((prev) => [...prev, payload.url])
  }, [])

  return (
    <div
      className={`font-sans z-50 fixed group right-0 drop-shadow-xl w-80 h-full
        flex flex-col bg-white ${!isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className='flex items-center py-2 gap-2 border-b'>
        <Button onClick={toggleSidebar} variant='ghost'>
          <XIcon className='w-4 h-4' />
        </Button>
        <Typography variant='h5'> Super RPA</Typography>
      </div>
      <div className='flex flex-1 overflow-auto px-2 py-4'>
        <div className='flex flex-col gap-8'>
          <div className='flex items-center gap-4'>
            <div className='w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center'>
              <CheckIcon className='h-4 w-4 text-white' />
            </div>
            <div className='text-sm font-medium text-blue-500'>Step 1</div>
          </div>
          <div className='flex items-center gap-4'>
            <div className='w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center'>
              <Typography className='text-white'>2</Typography>
            </div>
            <div className='text-sm font-medium text-blue-500'>Step 2</div>
          </div>
          <div className='flex items-center gap-4'>
            <div className='w-8 h-8 rounded-full bg-gray-500 dark:bg-gray-400 flex items-center justify-center'>
              <Typography className='text-white'>3</Typography>
            </div>
            <div className='text-sm font-medium text-gray-500 dark:text-gray-400'>
              Step 3
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
