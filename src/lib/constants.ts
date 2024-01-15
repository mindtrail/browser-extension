import type { PlasmoCSConfig } from 'plasmo'

export const AUTO_SAVE_DELAY = 60 // seconds
export const MIN_TEXT_FOR_CLIPPING = 10

export const MESSAGES = {
  AUTO_SAVE: 'auto-save',
  USER_TRIGGERED_SAVE: 'user-triggered-save',
  SEARCH_HISTORY: 'search-history',
  UPDATE_ICON: 'update-icon',
}

export const DEFAULT_EXCLUDE_LIST = [
  'https://mail.google.com',
  'https://docs.google.com',
  'https://drive.google.com',
]

export const CONTENT_SCRIPT_MATCH = ['https://*/*', 'http://*/*', 'file://*/*']

export const CONTENT_SCRIPT_EXCLUDE = [
  'http://localhost:*/*',
  'https://*.google.com/*',
  'https://www.google.com/*',
  'https://*.slack.com/*',
  'https://*.zoom.us/*',
  'https://*.youtube.com/*',
  'https://*.openai.com/*',
  'https://*.github.com/*',
  'https://*.gmail.com/*',
  'https://*.plasmo.com/*',
]

export const PLASMO_CONFIG: PlasmoCSConfig = {
  matches: CONTENT_SCRIPT_MATCH,
  exclude_matches: CONTENT_SCRIPT_EXCLUDE,
}

export enum OverlayPosition {
  top = 'top',
  bottom = 'bottom',
  center = 'center',
}

export enum MoveDirection {
  up = 'up',
  down = 'down',
}

export const DEFAULT_EXTENSION_SETTINGS: StorageData = {
  autoSave: true,
  saveDelay: AUTO_SAVE_DELAY,
  excludeList: DEFAULT_EXCLUDE_LIST,
  overlayPosition: OverlayPosition.center,
}

export const EXCLUDED_TAGS_FOR_CLIPPING = ['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT']
