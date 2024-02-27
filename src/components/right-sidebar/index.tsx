import { useCallback, useMemo, useReducer } from 'react'
import type { Dispatch, SetStateAction } from 'react'

import { ChangePosition } from '~components/right-sidebar/change-position'
import { SavePage } from '~components/right-sidebar/save-page'

import { getPageData } from '~/lib/page-data'
import {
  DEFAULT_EXTENSION_SETTINGS,
  MESSAGES,
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

export const RightSidebar = ({ settings, setSettings }: RightSidebarProps) => {
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
  }, [])

  const handlePositionChange = useCallback(
    (direction: MoveDirection) => {
      const nextPosition = OVERLAY_NEXT_POS[currentPos][direction] || DEFAULT_OVERLAY_POS

      setSettings((prev) => ({ ...prev, overlayPosition: nextPosition }))
    },
    [currentPos],
  )

  return (
    <div
      className={`z-50 fixed group -right-8 drop-shadow-xl w-12 h-12
        flex flex-col justify-center ${YPos}`}
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
