import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { Storage } from '@plasmohq/storage'
import { useStorage } from '@plasmohq/storage/hook'

import { ChangePosition } from '~components/right-sidebar/change-position'
import { SavePage } from '~components/right-sidebar/save-page'

import { getPageData } from '~/lib/page-data'
import { getBaseResourceURL } from '~lib/utils'

import {
  DEFAULT_EXTENSION_SETTINGS,
  MESSAGES,
  STORAGE_AREA,
  MoveDirection,
  OverlayPosition,
} from '~/lib/constants'

interface RightSidebarProps {
  settings: SettingsStored
  setSettings: Dispatch<SetStateAction<SettingsStored>>
}

// Because of the dynamic nature of this, importing from constants won't work
const OVERLAY_Y_OFFSET = {
  [OverlayPosition.top]: 'top-36',
  [OverlayPosition.center]: 'top-[calc(50vh-48px)]',
  [OverlayPosition.bottom]: 'bottom-36',
}

const OVERLAY_NEXT_POS = {
  [OverlayPosition.top]: {
    [MoveDirection.down]: OverlayPosition.center,
  },
  [OverlayPosition.center]: {
    [MoveDirection.up]: OverlayPosition.top,
    [MoveDirection.down]: OverlayPosition.bottom,
  },
  [OverlayPosition.bottom]: {
    [MoveDirection.up]: OverlayPosition.center,
  },
}

const DEFAULT_OVERLAY_POS = DEFAULT_EXTENSION_SETTINGS.overlayPosition

const SAVED_WEBSITES_CONFIG = {
  key: STORAGE_AREA.SAVED_WEBSITES,
  instance: new Storage({ area: 'local' }), // Use localStorage instead of sync
}

export const RightSidebar = ({ settings, setSettings }: RightSidebarProps) => {
  const [savedWebsites, setSavedWebsites] = useStorage(SAVED_WEBSITES_CONFIG, [])
  const [currentPageIsSaved, setCurrentPageIsSaved] = useState(false)
  const [loading, toggleLoading] = useReducer((c) => !c, false)

  const currentPos = settings.overlayPosition || DEFAULT_OVERLAY_POS

  const YPos = useMemo(() => {
    return OVERLAY_Y_OFFSET[currentPos]
  }, [currentPos])

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

  const handlePositionChange = useCallback(
    (direction: MoveDirection) => {
      const nextPosition = OVERLAY_NEXT_POS[currentPos][direction] || DEFAULT_OVERLAY_POS

      setSettings((prev) => ({ ...prev, overlayPosition: nextPosition }))
    },
    [currentPos],
  )

  useEffect(() => {
    const saveStatus = savedWebsites.includes(getBaseResourceURL(window.location.href))
    setCurrentPageIsSaved(saveStatus)
  }, [savedWebsites])

  return (
    <div
      className={`z-20 fixed group -right-8 drop-shadow-xl w-12 h-12
        flex flex-col justify-center ${YPos}`}
    >
      <div
        className='flex flex-col gap-2 pointer-events-none
          group-hover:animate-slide-to-left group-hover:pointer-events-auto'
      >
        <ChangePosition
          handleClick={handlePositionChange}
          direction={MoveDirection.up}
          currentPos={currentPos}
        />
        <SavePage
          handleClick={handlePageSave}
          loading={loading}
          currentPageIsSaved={currentPageIsSaved}
        />
        <ChangePosition
          handleClick={handlePositionChange}
          direction={MoveDirection.down}
          currentPos={currentPos}
        />
      </div>
    </div>
  )
}
