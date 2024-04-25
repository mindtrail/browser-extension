import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { Storage } from '@plasmohq/storage'
import { useStorage } from '@plasmohq/storage/hook'
import { XIcon } from 'lucide-react'

import { getPageData } from '~/lib/page-data'
import { MESSAGES, STORAGE_KEY } from '~/lib/constants'

import { Typography } from '~components/typography'
import { Button } from '~/components/ui/button'

import { mockData } from './constants'
import { FlowBuilder } from './builder'
import { FlowRecorder } from './recorder'
import { FlowRunner } from './runner'

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
      <FlowRecorder />
      <FlowRunner />
      <div className='flex flex-1 overflow-auto py-2 w-full'>
        <FlowBuilder />
      </div>
    </div>
  )
}
