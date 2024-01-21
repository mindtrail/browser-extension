import cssText from 'data-text:~style.css'

import { useEffect, useState } from 'react'
import { useStorage } from '@plasmohq/storage/hook'

import { TooltipProvider } from '~/components/ui/tooltip'

import { ClippingOverlay } from '~/components/clipping'
import { RightSidebar } from '~/components/right-sidebar'

import { DEFAULT_EXTENSION_SETTINGS } from '~/lib/constants'
import { isHostExcluded } from '~lib/utils'

// Needed to inject the CSS into the page
export const getStyle = () => {
  const style = document.createElement('style')
  style.textContent = cssText
  return style
}

const UIOverlay = () => {
  const [overlayVisible, setOverlayVisible] = useState(true)
  const [settings, setSettings] = useStorage('settings', DEFAULT_EXTENSION_SETTINGS)

  console.log(222, settings)
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
    </TooltipProvider>
  )
}

export default UIOverlay
