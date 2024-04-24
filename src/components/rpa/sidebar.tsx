import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { Storage } from '@plasmohq/storage'
import { useStorage } from '@plasmohq/storage/hook'
import {
  XIcon,
  CheckIcon,
  CircleDotIcon,
  MousePointerClickIcon,
  GlobeIcon,
  PenLineIcon,
  TextSelectIcon,
} from 'lucide-react'

import { getPageData } from '~/lib/page-data'
import { MESSAGES, STORAGE_KEY } from '~/lib/constants'

import { Typography } from '~components/typography'
import { Button } from '~/components/ui/button'
import { RecordIcon } from '~/components/icons/record'

interface SidebarProps {
  settings: SettingsStored
  setSettings: Dispatch<SetStateAction<SettingsStored>>
}

const mockData = [
  {
    type: 'browse',
    selector: 'url',
    value: 'https://google.com',
    icon: GlobeIcon,
  },
  {
    type: 'form-edit',
    selector: 'input',
    value: 'Hello, World!',
    icon: PenLineIcon,
  },
  {
    type: 'click',
    selector: 'button',
    value: 'Search',
    icon: MousePointerClickIcon,
  },
  {
    type: 'click',
    selector: 'a',
    value: 'Learn more',
    icon: MousePointerClickIcon,
  },
  {
    type: 'select',
    selector: 'p',
    value: 'first paragraph',
    icon: TextSelectIcon,
  },
]

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
      <div className='w-full flex px-4 py-4'>
        <Button variant='outline' size='lg' className='flex gap-4 items-center'>
          <RecordIcon className='w-5 h-5' />
          Record Workflow
        </Button>
      </div>
      <div className='flex flex-1 overflow-auto py-2 w-full'>
        <div className='flex flex-col w-full px-2 py-2 cursor-default'>
          {mockData.map(({ type, value, icon: Icon }, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 px-2 py-4 w-full rounded-lg
                border border-transparent hover:border-input group/row`}
            >
              <div className='flex items-center justify-center w-8 h-8 rounded-full border border-foreground/50'>
                <Icon className='h-4 w-4 text-foreground/50' />
                {/* <Typography className='text-primary-foreground'>{index + 1}</Typography> */}
              </div>
              <div className='flex flex-col gap-1'>
                <Typography className='capitalize' variant='small-semi'>
                  {type}
                </Typography>
                <Typography variant='small'>{value}</Typography>
              </div>
              <Button
                variant='ghost'
                className={`invisible group-hover/row:visible absolute right-4`}
              >
                <XIcon className='w-4 h-4' />
              </Button>
            </div>
          ))}

          <div
            className={`flex items-center gap-4 px-2 py-2 my-2 w-full
              rounded-lg border border-dashed`}
          >
            <div className='w-8 h-8 rounded-full bg-secondary/70 flex items-center justify-center'>
              {/* <CheckIcon className='h-4 w-4 text-white' /> */}
              <Typography className='text-secondary-foreground'>
                {mockData?.length + 1}
              </Typography>
            </div>
            <div className='flex flex-col gap-1'>
              <Typography className='capitalize' variant='small-semi'>
                Next action
              </Typography>
              {/* <Typography variant='small'>{item.value}</Typography> */}
            </div>
            <Button
              variant='secondary'
              className={`invisible group-hover/row:visible absolute right-4`}
            >
              <XIcon className='w-4 h-4' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
