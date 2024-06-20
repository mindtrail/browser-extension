import { Storage } from '@plasmohq/storage'
import { useStorage } from '@plasmohq/storage/hook'

import { STORAGE_AREA, DEFAULT_SETTINGS } from '~/lib/constants'

const SETTINGS_CONFIG = {
  key: STORAGE_AREA.SETTINGS,
  instance: new Storage({ area: 'local' }), // Use localStorage instead of sync
}

export const useSettingsStorage = () => useStorage(SETTINGS_CONFIG, DEFAULT_SETTINGS)

const CLIPPINGS_CONFIG = {
  key: STORAGE_AREA.CLIPPINGS_BY_DS,
  instance: new Storage({ area: 'local' }), // Use localStorage instead of sync
}

export const useClippingsStorage = () => useStorage(CLIPPINGS_CONFIG, [])

const SAVED_WEBSITES_CONFIG = {
  key: STORAGE_AREA.SAVED_WEBSITES,
  instance: new Storage({ area: 'local' }), // Use localStorage instead of sync
}

export const useSavedWebsitesStorage = () => useStorage(SAVED_WEBSITES_CONFIG, [])
