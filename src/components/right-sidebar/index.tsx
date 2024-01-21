import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'

import { ChangePosition } from '~components/right-sidebar/change-position'
import { SavePage } from '~components/right-sidebar/save-page'

import { getPageData } from '~/lib/page-data'
import {
  DEFAULT_EXTENSION_SETTINGS,
  MESSAGES,
  MoveDirection,
  OVERLAY_NEXT_POS,
  OVERLAY_Y_OFFSET,
} from '~/lib/constants'

import { isHostExcluded } from '~lib/utils'

interface RightSidebarProps {
  settings: SettingsStored
  setSettings: Dispatch<SetStateAction<SettingsStored>>
}

export const RightSidebar = (props: RightSidebarProps) => {
  const { settings, setSettings } = props

  const [loading, toggleLoading] = useReducer((c) => !c, false)
  const [overlayVisible, setOverlayVisible] = useState(true)

  const { excludeList } = settings
  const currentPos =
    settings.overlayPosition || DEFAULT_EXTENSION_SETTINGS.overlayPosition

  const YPos = useMemo(() => {
    return OVERLAY_Y_OFFSET[currentPos]
  }, [currentPos])

  useEffect(() => {
    const hostExcluded = isHostExcluded(excludeList)
    setOverlayVisible(!hostExcluded)
  }, [excludeList])

  const handlePageSave = useCallback(async () => {
    toggleLoading()
    const payload = getPageData()

    const result = await chrome.runtime.sendMessage({
      message: MESSAGES.SAVE_PAGE,
      payload,
    })

    toggleLoading()

    if (result?.error) {
      alert('Error saving Page. Please try again.')

      console.error(result.error)
      return
    }
  }, [])

  const handlePositionChange = useCallback(
    (direction: MoveDirection) => {
      const nextPosition =
        OVERLAY_NEXT_POS[currentPos][direction] ||
        DEFAULT_EXTENSION_SETTINGS.overlayPosition

      setSettings((prev) => ({ ...prev, overlayPosition: nextPosition }))
    },
    [currentPos],
  )

  if (!overlayVisible) {
    return null
  }

  return (
    <div
      className={`z-50 fixed group -right-8 drop-shadow-xl w-12 h-12 flex flex-col justify-center
         ${YPos} `}
    >
      <div className='flex flex-col gap-2 pointer-events-none group-hover:animate-slide-to-left group-hover:pointer-events-auto'>
        <ChangePosition
          handleClick={handlePositionChange}
          direction={MoveDirection.up}
          currentPos={currentPos}
        />
        <SavePage handleClick={handlePageSave} loading={loading} />
        <ChangePosition
          handleClick={handlePositionChange}
          direction={MoveDirection.down}
          currentPos={currentPos}
        />
      </div>
    </div>
  )
}
