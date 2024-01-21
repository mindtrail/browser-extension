import type { PlasmoCSConfig } from 'plasmo'

export const AUTO_SAVE_DELAY = 60 // seconds
export const MIN_TEXT_FOR_CLIPPING = 10

export const MESSAGES = {
  SAVE_PAGE: 'save-page',
  SAVE_CLIPPING: 'save-clipping',
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

export const DEFAULT_EXTENSION_SETTINGS: SettingsStored = {
  autoSave: true,
  saveDelay: AUTO_SAVE_DELAY,
  excludeList: DEFAULT_EXCLUDE_LIST,
  overlayPosition: OverlayPosition.center,
}

export const EXCLUDED_TAGS_FOR_CLIPPING = ['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT']

export const HOST = {
  LOCAL: 'http://localhost:3000',
  REMOTE: 'https://app-chat-jgnk6lxbhq-ey.a.run.app',
}

export const API = {
  SAVE_PAGE: '/api/data-source/browser-extension',
  CLIPPING: '/api/clipping',
  SEARCH_HISTORY: '/api/history',
}

export const OVERLAY_Y_OFFSET = {
  [OverlayPosition.top]: 'top-36',
  [OverlayPosition.center]: 'top-[calc(50vh-48px)]',
  [OverlayPosition.bottom]: 'bottom-36',
}

export const OVERLAY_NEXT_POS = {
  [OverlayPosition.top]: {
    [MoveDirection.down]: OverlayPosition.center,
  },
  [OverlayPosition.center]: {
    [MoveDirection.up]: OverlayPosition.top,
    [MoveDirection.down]: OverlayPosition.bottom,
  },
  [OverlayPosition.bottom]: {
    [MoveDirection.up]: OverlayPosition.center,
  },
}
