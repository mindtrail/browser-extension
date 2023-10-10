import { useReducer } from "react"

import { IconSpinner } from "./IconSpinner"

export const CountButton = () => {
  const [loading, toggleLoading] = useReducer((c) => !c, false)

  const handleClick = async () => {
    toggleLoading()
    console.log(123, document)
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
    <button
      onClick={handleClick}
      type="button"
      disabled={loading}
      className="plasmo-flex plasmo-flex-row plasmo-items-center plasmo-px-4 plasmo-py-2 plasmo-text-sm plasmo-rounded-lg plasmo-transition-all plasmo-border-none
      plasmo-shadow-lg hover:plasmo-shadow-md
      active:plasmo-scale-105 plasmo-bg-slate-50 hover:plasmo-bg-slate-100 plasmo-text-slate-800 hover:plasmo-text-slate-900">
      Save
      {loading && <IconSpinner className="plasmo-ml-2" />}
    </button>
  )
}
