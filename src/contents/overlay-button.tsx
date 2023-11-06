import cssText from 'data-text:~style.css'
import type { PlasmoCSConfig } from 'plasmo'
import { useReducer } from 'react'

import { StoreButton } from '~/components/store-button'
import { CONTENT_SCRIPT_EXCLUDE, MESSAGES } from '~/lib/constants'
import { getPageData } from '~/lib/page-data'

// Needed to inject the CSS into the page
export const getStyle = () => {
  const style = document.createElement('style')
  style.textContent = cssText
  return style
}

// IMPORTANT: Config does not accept array references, so we create a new one
export const config: PlasmoCSConfig = {
  matches: ['https://*/*', 'http://*/*', 'file://*/*'],
  exclude_matches: [...CONTENT_SCRIPT_EXCLUDE],
}

const PlasmoOverlay = () => {
  const [loading, toggleLoading] = useReducer((c) => !c, false)

  const handleClick = async () => {
    toggleLoading()
    const payload = getPageData(false)

    const response = await chrome.runtime.sendMessage({
      message: MESSAGES.USER_TRIGGERED_SAVE,
      payload,
    })
    toggleLoading()
    // do something with response here, not outside the function
    console.log(response)
  }

  return (
    <div className="z-50 flex fixed top-28 right-[-4px] shadow-md">
      <StoreButton handleClick={handleClick} loading={loading} />
    </div>
  )
}

export default PlasmoOverlay
