import cssText from 'data-text:~style.css'

import { useEffect, useState } from 'react'
import { Storage } from '@plasmohq/storage'
import { useStorage } from '@plasmohq/storage/hook'

import { TooltipProvider } from '~/components/ui/tooltip'

import { ClippingOverlay } from '~/components/clipping'
import { RightSidebar } from '~/components/right-sidebar'
import { SidebarRPA } from '~components/rpa/sidebar'

import { DEFAULT_EXTENSION_SETTINGS, STORAGE_KEY } from '~/lib/constants'
import { isHostExcluded } from '~/lib/utils'

// Needed to inject the CSS into the page
export const getStyle = () => {
  const style = document.createElement('style')
  style.textContent = cssText
  return style
}

const STORAGE_SETTINGS = {
  key: STORAGE_KEY.SETTINGS,
  instance: new Storage({ area: 'local' }), // Use localStorage instead of sync
}

const UIOverlay = () => {
  const [overlayVisible, setOverlayVisible] = useState(true)
  const [settings, setSettings] = useStorage(STORAGE_SETTINGS, DEFAULT_EXTENSION_SETTINGS)

  const { excludeList } = settings

  useEffect(() => {
    const hostExcluded = isHostExcluded(excludeList)
    setOverlayVisible(!hostExcluded)
  }, [excludeList])

  if (!overlayVisible) {
    return null
  }

  return (
    <TooltipProvider>
      <ClippingOverlay />
      <RightSidebar settings={settings} setSettings={setSettings} />
      <SidebarRPA settings={settings} setSettings={setSettings} />
    </TooltipProvider>
  )
}

export default UIOverlay
