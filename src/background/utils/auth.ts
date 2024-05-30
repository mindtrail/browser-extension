import { API } from '~/lib/constants'
import * as api from '~background/lib/api'
import { initializeExtension } from './initialize'

export const authenticateAndRetry = async (
  sendResponse: ContentScriptResponse,
  callback: () => void,
) => {
  try {
    let loginWindow = null
    let loginTabId = null

    // Open the login window
    chrome.windows.create(
      {
        url: `${api.TARGET_HOST}${API.SIGN_IN}?callbackUrl=${API.SUCCESS_LOGIN}`,
        type: 'popup',
        width: 800,
        height: 600,
        top: 100,
        left: 200,
      },
      (newWindow) => {
        loginWindow = newWindow
        loginTabId = newWindow?.tabs[0]?.id
      },
    )

    const onTabUpdate = async function (
      tabId: number,
      changeInfo: any,
      tab: chrome.tabs.Tab,
    ) {
      if (tabId !== loginTabId) {
        return // Ignore updates from tabs not in the login window
      }

      const url = changeInfo?.url || ''
      // Only some updates inlcude the url, like load, we only listen to those
      if (!url) {
        return
      }

      const isSuccessLogin =
        url?.includes(`${API.SUCCESS_LOGIN}`) && !url?.includes(API.SIGN_IN)

      if (isSuccessLogin) {
        initializeExtension()
        callback()

        chrome.tabs.onUpdated.removeListener(onTabUpdate)
        chrome.windows.onRemoved.removeListener(onWindowClose)
        chrome.windows.remove(loginWindow.id)
      }
    }

    const onWindowClose = function (closedWindowId: number) {
      if (closedWindowId === loginWindow.id) {
        // Reset the loginWindow.Id
        loginWindow = null
        sendResponse({
          error: { message: 'Login unsuccessful. Window closed', status: 401 },
        })

        // Remove the listeners
        chrome.tabs.onUpdated.removeListener(onTabUpdate)
        chrome.windows.onRemoved.removeListener(onWindowClose)
      }
    }

    chrome.windows.onRemoved.addListener(onWindowClose)

    chrome.tabs.onUpdated.addListener(onTabUpdate)
  } catch (error) {
    console.error('Auth error :::', error)
  }
}
