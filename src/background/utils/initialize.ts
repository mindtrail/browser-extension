import { updateExtensionIcon } from '~background/utils/update-icon'
import { fetchClippingList } from '../messages/clippings'
import { getStorage } from '~/lib/storage'

import { DEFAULT_EXTENSION_SETTINGS, STORAGE_AREA } from '~/lib/constants'

export const initializeExtension = async () => {
  const storage = await getStorage()

  const settings = (await storage.get(STORAGE_AREA.SETTINGS)) as SettingsStored
  if (!settings) {
    await storage.set(STORAGE_AREA.SETTINGS, DEFAULT_EXTENSION_SETTINGS)
  }

  updateExtensionIcon()
  fetchClippingList()
  // fetchDataSources...
}
