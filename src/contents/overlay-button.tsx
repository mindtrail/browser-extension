import cssText from 'data-text:~style.css'
import { minimatch } from 'minimatch'
import { useMemo, useReducer, useState } from 'react'

import { Storage } from '@plasmohq/storage'

import { StoreButton } from '~/components/store-button'
import { MESSAGES } from '~/lib/constants'
import { getPageData } from '~/lib/page-data'

// Needed to inject the CSS into the page
export const getStyle = () => {
  const style = document.createElement('style')
  style.textContent = cssText
  return style
}

const PlasmoOverlay = () => {
  const [loading, toggleLoading] = useReducer((c) => !c, false)
  const [overlayVisible, setOverlayVisible] = useState(false)

  const handleClick = async () => {
    toggleLoading()
    const payload = getPageData(false)

    await chrome.runtime.sendMessage({
      message: MESSAGES.USER_TRIGGERED_SAVE,
      payload,
    })
    toggleLoading()
  }

  useMemo(async () => {
    const overlayVisibility = await shouldAddOverlay()
    setOverlayVisible(overlayVisibility)
  }, [])

  // const addOverlay = await shouldAddOverlay()

  return (
    overlayVisible && (
      <div className="z-50 group flex flex-col fixed top-36 right-[-8px] drop-shadow-xl">
        <StoreButton handleClick={handleClick} loading={loading} />
      </div>
    )
  )
}

async function shouldAddOverlay() {
  const hostName = window.location.hostname
  const storage = new Storage()
  const settings = (await storage.get('settings')) as StorageData
  const { excludeList } = settings

  return !excludeList.some((pattern) => minimatch(hostName, pattern))
}

export default PlasmoOverlay
