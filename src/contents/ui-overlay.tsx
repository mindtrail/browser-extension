import cssText from 'data-text:~style.css'

import { useEffect, useState } from 'react'
import { TooltipProvider } from '~/components/ui/tooltip'

import { ClippingOverlay } from '~/components/clipping'
import { RightSidebar } from '~/components/right-sidebar'
import { SidebarRPA } from '~components/rpa/sidebar'

import { isHostExcluded } from '~lib/utils'
import { useSettingsStorage } from '~/lib/hooks/storage'

// Needed to inject the CSS into the page
export const getStyle = () => {
  const style = document.createElement('style')
  style.textContent = cssText
  return style
}

const UIOverlay = () => {
  const [overlayVisible, setOverlayVisible] = useState(true)
  const [settings, setSettings] = useSettingsStorage()

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
