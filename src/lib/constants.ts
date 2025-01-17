export const AUTO_SAVE_DELAY = 60 // seconds
export const MIN_TEXT_FOR_CLIPPING = 10

export enum MESSAGE_AREAS {
  CLIPPINGS = 'clippings',
  DATA_SOURCEs = 'data-sources',
  FLOWS = 'flows',
  SEARCH_HISTORY = 'search-history',
  UPDATE_ICON = 'extension-icon',
}

export const MESSAGES = {
  SAVE_PAGE: 'save-page',
  SAVE_CLIPPING: 'save-clipping',
  SEARCH_HISTORY: 'search-history',
  UPDATE_ICON: 'extension-icon',
  GET_CLIPPING_LIST: 'get-clipping-list',
  DELETE_CLIPPING: 'delete-clipping',
  AUTH_REDIRECT: 'auth-redirect',
  CLIPPING_LIST_UPDATED: 'clipping-list-updated',
  CREATE_FLOW: 'create-flow',
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
  REMOTE: 'https://mindtrail-alexpausan.vercel.app',
}

export const API = {
  SAVE_PAGE: '/api/data-source/browser-extension',
  CLIPPING: '/api/clipping',
  DATA_SOURCE: '/api/data-source',
  SEARCH_HISTORY: '/api/history',
  SIGN_IN: '/api/auth/signin',
  SUCCESS_LOGIN: '/?extension-login=true',
}

export const HIGHLIGHT_CLASS = 'mindtrail-clipping'
export const SPLIT_TEXTNODE_CLASS = 'mindtrail-split-textNode'

export const STORAGE_AREA = {
  CLIPPINGS_BY_DS: 'clippings-by-ds',
  SAVED_WEBSITES: 'saved-websites',
  SETTINGS: 'settings',
  RECORDER: 'recorder',
  RUNNER: 'runner',
  EVENTS: 'events',
  TASKS: 'tasks',
}

export const CLIPPING_BTN_OFFSET = 16

export const ACTIVE_TAB = {
  MAIN: 'main',
  FLOWS: 'flows',
}
export const DEFAULT_SETTINGS = {
  autoSave: true,
  saveDelay: AUTO_SAVE_DELAY,
  excludeList: DEFAULT_EXCLUDE_LIST,
  isSidebarOpen: false,
  activeTab: ACTIVE_TAB.MAIN,
}

export const URL_REGEX =
  /^(https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(:[0-9]+)?(\/[\w.-]*)*\/?$/

export const DEFAULT_RECORDER_STATE = {
  isRecording: false,
  isPaused: false,
  isSaving: false,
  eventsList: [],
}

export enum DOM_EVENT {
  MOUSEOVER = 'mouseover',
  KEYDOWN = 'keydown',
  KEYUP = 'keyup',
  CLICK = 'click',
  INPUT = 'input',
}

export const ACTION_TYPE = {
  CLICK: DOM_EVENT.CLICK,
  INPUT: DOM_EVENT.INPUT,
  NAV: 'navigation',
  EXTRACT: 'extract',
}

export const DEFAULT_RUNNER_STATE: RunnerState = {
  runningTask: null,
  runningFlow: null,
  runningQuery: '',
  retries: 0,
  eventsCompleted: [],
  tasksQueue: [],
}

export const SUPABASE_CHANNELS = {
  FLOWS: 'flows-channel',
  TASKS: 'tasks-channel',
  ACTION_GROUPS: 'action-groups-channel',
  THREADS: 'threads-channel',
}

export enum TASK_STATUS {
  PENDING = 'pending',
  RUNNING = 'running',
  ERROR = 'error',
  FAILED = 'failed',
  COMPLETED = 'completed',
  STOPPED = 'stopped',
}

export { TASK_STATUS as EVENT_STATUS }
