import '~style.css'

import { useEffect, useState } from 'react'
import { Storage } from '@plasmohq/storage'
import { useStorage } from '@plasmohq/storage/hook'

import { TooltipProvider } from '~/components/ui/tooltip'

import { ClippingOverlay } from '~/components/clipping'
import { SidebarRPA } from '~components/rpa/sidebar'

import { DEFAULT_EXTENSION_SETTINGS, STORAGE_KEY } from '~/lib/constants'
import { isHostExcluded } from '~/lib/utils'

const STORAGE_SETTINGS = {
  key: STORAGE_KEY.SETTINGS,
  instance: new Storage({ area: 'local' }), // Use localStorage instead of sync
}

const SidePanelRPA = () => {
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
      <SidebarRPA />
    </TooltipProvider>
  )
}

export default SidePanelRPA
