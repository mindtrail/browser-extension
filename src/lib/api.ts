import { HOST, API } from '~/lib/constants'

const NODE_ENV = process.env.NODE_ENV
const IS_DEV = NODE_ENV === 'development'
const TARGET_HOST = IS_DEV ? HOST.LOCAL : HOST.REMOTE

type SendResponse = (resp: any) => void

// Generic fetch wrapper
async function makeAPICall(url: string, options = {}) {
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API error! Status: ${response.status}`, {
      cause: response,
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
  makeAPICall(`${TARGET_HOST + API.SEARCH_HISTORY}?search=${searchQuery}`)
