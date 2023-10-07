import { useReducer } from "react"

export const CountButton = () => {
  const [count, increase] = useReducer((c) => c + 1, 0)

  const handleClick = async () => {
    increase()
    console.log(123, document)
    const dom = document.documentElement.outerHTML
    const payload = {
      type: "dom",
      url: window.location.href,
      dom
    }
    console.log(payload)

    const response = await chrome.runtime.sendMessage({
      greeting: "hello",
      payload
    })
    // do something with response here, not outside the function
    console.log(response)
  }

  return (
    <button
      onClick={handleClick}
      type="button"
      className="plasmo-flex plasmo-flex-row plasmo-items-center plasmo-px-4 plasmo-py-2 plasmo-text-sm plasmo-rounded-lg plasmo-transition-all plasmo-border-none
      plasmo-shadow-lg hover:plasmo-shadow-md
      active:plasmo-scale-105 plasmo-bg-slate-50 hover:plasmo-bg-slate-100 plasmo-text-slate-800 hover:plasmo-text-slate-900">
      Count:
      <span className="plasmo-inline-flex plasmo-items-center plasmo-justify-center plasmo-w-8 plasmo-h-4 plasmo-ml-2 plasmo-text-xs plasmo-font-semibold plasmo-rounded-full">
        {count}
      </span>
    </button>
  )
}
