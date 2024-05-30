import '~style.css'

import { useEffect, useState } from 'react'

import { TooltipProvider } from '~/components/ui/tooltip'
import { ClippingOverlay } from '~/components/clipping'
import { SidebarRPA } from '~components/rpa/sidebar'

import { isHostExcluded } from '~lib/utils'
import { useSettingsStorage } from '~/lib/hooks/storage'

const SidePanelRPA = () => {
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
      <SidebarRPA settings={settings} setSettings={setSettings} />
    </TooltipProvider>
  )
}

export default SidePanelRPA
