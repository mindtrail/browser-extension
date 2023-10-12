import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useReducer } from "react"

import { StoreButton } from "~features/store-button"
import { MESSAGES } from "~lib/constants"
import { getPageData } from "~lib/page-data"

export const config: PlasmoCSConfig = {
  matches: ["https://*/*"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const PlasmoOverlay = () => {
  const [loading, toggleLoading] = useReducer((c) => !c, false)

  const handleClick = async () => {
    toggleLoading()

    const payload = getPageData()

    const response = await chrome.runtime.sendMessage({
      message: MESSAGES.USER_TRIGGERED_SAVE,
      payload
    })
    toggleLoading()
    // do something with response here, not outside the function
    console.log(response)
  }

  return (
    <div className="z-50 flex fixed top-20 right-[-4px] shadow-md">
      <StoreButton handleClick={handleClick} loading={loading} />
    </div>
  )
}

export default PlasmoOverlay
