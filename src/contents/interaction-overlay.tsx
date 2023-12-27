import cssText from 'data-text:~style.css'
import { minimatch } from 'minimatch'
import { useCallback, useEffect, useReducer, useState } from 'react'

import { useStorage } from '@plasmohq/storage/hook'

import { TooltipProvider } from '~/components/ui/tooltip'
import {
  DEFAULT_EXTENSION_SETTINGS,
  MESSAGES,
  MoveDirection,
  OverlayPosition,
} from '~/lib/constants'
import { getPageData } from '~/lib/page-data'
import { MoveOverlay } from '~components/overlay/move-overlay'
import { StoreButton } from '~components/overlay/store-button'

// Needed to inject the CSS into the page
export const getStyle = () => {
  const style = document.createElement('style')
  style.textContent = cssText
  return style
}

const OVERLAY_Y_OFFSET = {
  [OverlayPosition.top]: 'top-36',
  [OverlayPosition.center]: 'top-[calc(50vh-48px)]',
  [OverlayPosition.bottom]: 'bottom-36',
}

const OVERLAY_NEW_POS = {
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

const InteractionOverlay = () => {
  const [loading, toggleLoading] = useReducer((c) => !c, false)
  const [overlayVisible, setOverlayVisible] = useState(true)

  const [settings, setSettings] = useStorage(
    'settings',
    DEFAULT_EXTENSION_SETTINGS
  )

  const { excludeList } = settings
  const currentPos = settings.overlayPosition

  useEffect(() => {
    const overlayVisibility = isOverlayAllowedOnWebsite(excludeList)
    setOverlayVisible(overlayVisibility)
  }, [excludeList])

  const handlePageSave = useCallback(async () => {
    toggleLoading()
    const payload = getPageData(false)

    await chrome.runtime.sendMessage({
      message: MESSAGES.USER_TRIGGERED_SAVE,
      payload,
    })
    toggleLoading()
  }, [])

  const handlePositionChange = useCallback(
    (direction: MoveDirection) => {
      const nextPosition = OVERLAY_NEW_POS[currentPos][direction]

      setSettings((prev) => ({ ...prev, overlayPosition: nextPosition }))
    },
    [currentPos]
  )

  if (!overlayVisible || !currentPos) {
    return null
  }

  return (
    <TooltipProvider>
      <div
        className={`z-50 fixed group -right-8 drop-shadow-xl w-12 h-12 flex flex-col justify-center
         ${OVERLAY_Y_OFFSET[currentPos]} `}>
        <div className="flex flex-col gap-2 pointer-events-none group-hover:animate-slide-to-left group-hover:pointer-events-auto">
          <MoveOverlay
            handleClick={handlePositionChange}
            direction={MoveDirection.up}
            currentPos={currentPos}
          />
          <StoreButton handleClick={handlePageSave} loading={loading} />
          <MoveOverlay
            handleClick={handlePositionChange}
            direction={MoveDirection.down}
            currentPos={currentPos}
          />
        </div>
      </div>
    </TooltipProvider>
  )
}

export default InteractionOverlay

function isOverlayAllowedOnWebsite(excludeList: string[] = []) {
  const hostName = window.location.hostname

  return !excludeList?.some((pattern) => minimatch(hostName, pattern))
}
