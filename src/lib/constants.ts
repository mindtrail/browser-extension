export const AUTO_SAVE_INTERVAL = 60 // seconds

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
  'https://*.slack.com/*',
  'https://*.zoom.us/*',
  'https://*.youtube.com/*',
  'https://*.openai.com/*',
  'https://*.github.com/*',
  'https://*.gmail.com/*',
]
