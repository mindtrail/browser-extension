import { authExtension } from '../utils/auth'
import { HOST, API } from '~/lib/constants'

const NODE_ENV = process.env.NODE_ENV
const IS_DEV = NODE_ENV === 'development'
export const TARGET_HOST = IS_DEV ? HOST.LOCAL : HOST.REMOTE

// The extension has host_permissions to localhost & the deployed app.
// That means it can access the cookies and send them with every fetch request.
async function makeAPICall(url: string, options = {}) {
  try {
    let response = await fetch(url, {
      credentials: 'include',
      ...options,
    })

    if (!response.ok) {
      const { status } = response

      if (status === 401) {
        console.log('Authenticating')
        const authSuccess = await authExtension()

        console.log(222, authSuccess)
        if (!authSuccess) {
          return { error: { status: 'Could not log in.', message: '' } }
        }

        // Retry operation after sign in
        response = await fetch(url, {
          credentials: 'include',
          ...options,
        })

        if (!response.ok) {
          const message =
            (await response?.text()) || (await response?.json()) || 'API error'
          return { error: { status: 'API error.', message } }
        }
      }
    }

    return await response.json()
  } catch (error) {
    console.log('API call error:', error)
    return { error: { status: 'API error.', message: error } }
  }
}

export const savePageAPICall = (payload: PageData): Promise<CreatePageResponse> =>
  makeAPICall(TARGET_HOST + API.SAVE_PAGE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

export const saveClippingAPICall = (payload: SavedClipping) =>
  makeAPICall(TARGET_HOST + API.CLIPPING, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

export const deleteClippingAPICall = (clippingId: string) =>
  makeAPICall(`${TARGET_HOST + API.CLIPPING}/${clippingId}`, {
    method: 'DELETE',
  })

export const searchHistoryAPICall = (searchQuery: string) =>
  makeAPICall(`${TARGET_HOST + API.SEARCH_HISTORY}?searchQuery=${searchQuery}`)

export const getClippingListAPICall = () =>
  makeAPICall(`${TARGET_HOST + API.CLIPPING}?groupByDataSource=true`)

export const fetchSavedDSListAPICall = () =>
  makeAPICall(`${TARGET_HOST + API.DATA_SOURCE}?type=web_page`)
