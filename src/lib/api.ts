import { HOST, API } from '~/lib/constants'

const NODE_ENV = process.env.NODE_ENV
const IS_DEV = NODE_ENV === 'development'
export const TARGET_HOST = IS_DEV ? HOST.LOCAL : HOST.REMOTE

// The extension has host_permissions to localhost & the deployed app.
// That means it can access the cookies and send them with every fetch request.
async function makeAPICall(url: string, options = {}) {
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
  })

  if (!response.ok) {
    let message = (await response?.text()) || (await response?.json()) || 'API error'
    const { status } = response

    throw new Error(message, {
      cause: { message, status },
    })
  }

  return await response.json()
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
