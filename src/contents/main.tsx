import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useReducer } from "react"

import { StoreButton } from "~features/store-button"

export const config: PlasmoCSConfig = {
  matches: ["https://*/*"],
  all_frames: true
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

    const html = document.documentElement.outerHTML
    const pageTitle = document.title
    const metaDescription = // @ts-ignore
      document.querySelector('meta[name="description"]')?.content

    const url = window.location.href
    const hostName = window.location.hostname

    const payload = {
      html,
      url,
      storageMetadata: {
        pageTitle,
        metaDescription,
        hostName
      }
    }

    const response = await chrome.runtime.sendMessage({
      greeting: "hello",
      payload
    })
    toggleLoading()
    // do something with response here, not outside the function
    console.log(response)
  }

  return (
    <div className="plasmo-z-50 plasmo-flex plasmo-fixed plasmo-top-24 plasmo-right-[-4px] plasmo-shadow-md">
      <StoreButton handleClick={handleClick} loading={loading} />
    </div>
  )
}

export default PlasmoOverlay
