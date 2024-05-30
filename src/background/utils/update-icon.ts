import { Storage } from '@plasmohq/storage'

import autoModeIcon from 'url:~assets/icon.development-32.png'
import savedIcon from 'url:~assets/saved-32.png'

import { STORAGE_AREA } from '~/lib/constants'

// Based on Auto/Manual save, update the extension icon
export async function updateExtensionIcon(storage: Storage = undefined) {
  const settings = (await storage.get(STORAGE_AREA.SETTINGS)) as SettingsStored
  const autoSave = settings?.autoSave

  chrome?.action?.setIcon({
    path: autoSave ? autoModeIcon : savedIcon,
  })

  console.log('Update Icon --- :', autoSave)
}
