import { API } from '~/lib/constants'
import * as api from '~background/lib/api'
import { initializeExtension } from './initialize'

export const authExtension = async (): Promise<boolean> => {
  let loginWindow = null
  let loginTabId = null

  return new Promise((resolve, reject) => {
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

    const onTabUpdate = async (tabId: number, changeInfo: any) => {
      if (tabId !== loginTabId) return

      const url = changeInfo?.url || ''
      if (!url) return

      const isSuccessLogin =
        url.includes(`${API.SUCCESS_LOGIN}`) && !url.includes(API.SIGN_IN)

      if (isSuccessLogin) {
        initializeExtension()
        chrome.tabs.onUpdated.removeListener(onTabUpdate)
        chrome.windows.onRemoved.removeListener(onWindowClose)
        chrome.windows.remove(loginWindow.id)
        resolve(true)
      }
    }

    const onWindowClose = (closedWindowId: number) => {
      if (closedWindowId === loginWindow.id) {
        loginWindow = null
        chrome.tabs.onUpdated.removeListener(onTabUpdate)
        chrome.windows.onRemoved.removeListener(onWindowClose)
        reject('Window closed')
      }
    }

    chrome.windows.onRemoved.addListener(onWindowClose)
    chrome.tabs.onUpdated.addListener(onTabUpdate)
  })
}
