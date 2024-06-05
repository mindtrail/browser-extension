import autoModeIcon from 'url:~assets/icon.development-32.png'
import savedIcon from 'url:~assets/saved-32.png'

import { getStorage } from '~/lib/storage'
import { STORAGE_AREA } from '~/lib/constants'

// Based on Auto/Manual save, update the extension icon
export async function updateExtensionIcon() {
  const storage = await getStorage()

  const settings = (await storage.get(STORAGE_AREA.SETTINGS)) as SettingsStored
  const autoSave = settings?.autoSave

  chrome?.action?.setIcon({
    path: autoSave ? autoModeIcon : savedIcon,
  })

  console.log('Autosave status --- :', autoSave)
}
