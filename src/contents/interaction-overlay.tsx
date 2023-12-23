import cssText from 'data-text:~style.css'
import { minimatch } from 'minimatch'
import { useMemo, useReducer, useState, useEffect, useCallback } from 'react'

import { Storage } from '@plasmohq/storage'

import { TooltipProvider } from '~/components/ui/tooltip'
import { StoreButton } from '~components/overlay/store-button'
import {
  MoveOverlay,
  MoveDirection,
  OverlayPosition,
} from '~components/overlay/move-overlay'

import { MESSAGES } from '~/lib/constants'
import { getPageData } from '~/lib/page-data'

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
    [MoveDirection.bottom]: OverlayPosition.center,
  },
  [OverlayPosition.center]: {
    [MoveDirection.top]: OverlayPosition.top,
    [MoveDirection.bottom]: OverlayPosition.bottom,
  },
  [OverlayPosition.bottom]: {
    [MoveDirection.top]: OverlayPosition.center,
  },
}

const InteractionOverlay = () => {
  const [loading, toggleLoading] = useReducer((c) => !c, false)
  const [overlayVisible, setOverlayVisible] = useState(false)
  const [currentPos, setCurrentPos] = useState(OverlayPosition.center)

  const handleClick = useCallback(async () => {
    toggleLoading()
    const payload = getPageData(false)

    await chrome.runtime.sendMessage({
      message: MESSAGES.USER_TRIGGERED_SAVE,
      payload,
    })
    toggleLoading()
  }, [])

  useEffect(() => {
    const fetchStorageData = async () => {
      const storage = new Storage()
      const settings = (await storage.get('settings')) as StorageData

      const { excludeList } = settings

      const overlayVisibility = await isOverlayAllowedOnWebsite(excludeList)
      setOverlayVisible(overlayVisibility)
    }
    fetchStorageData()
  }, [])

  const handlePositionChange = useCallback(
    (direction: MoveDirection) => {
      console.log('handlePositionChange', currentPos, direction)
      const nextPosition = OVERLAY_NEW_POS[currentPos][direction]

      setCurrentPos(nextPosition)
    },
    [currentPos]
  )

  return (
    <TooltipProvider>
      {overlayVisible && (
        <div
          className={`z-50 group flex flex-col fixed right-[-8px] drop-shadow-xl ${OVERLAY_Y_OFFSET[currentPos]} `}>
          <MoveOverlay
            handleClick={handlePositionChange}
            direction={MoveDirection.top}
            currentPos={currentPos}
          />
          <StoreButton handleClick={handleClick} loading={loading} />
          <MoveOverlay
            handleClick={handlePositionChange}
            direction={MoveDirection.bottom}
            currentPos={currentPos}
          />
        </div>
      )}
    </TooltipProvider>
  )
}

async function isOverlayAllowedOnWebsite(excludeList: string[] = []) {
  const hostName = window.location.hostname

  return !excludeList?.some((pattern) => minimatch(hostName, pattern))
}

export default InteractionOverlay
