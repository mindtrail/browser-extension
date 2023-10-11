import Brain from "react:~/assets/brain.svg"

import { IconSpinner } from "./icon-spinner"

interface StoreButtonProps {
  handleClick: () => void
  loading: boolean
}

export const StoreButton = ({ handleClick, loading }: StoreButtonProps) => {
  return (
    <button
      title="Store in Mind Trail"
      onClick={handleClick}
      type="button"
      disabled={loading}
      className="plasmo-relative plasmo-flex plasmo-flex-row plasmo-items-center plasmo-rounded-lg plasmo-transition-all plasmo-border-none plasmo-shadow-lg hover:plasmo-shadow-md active:plasmo-scale-105 plasmo-bg-slate-50 hover:plasmo-bg-slate-100 plasmo-opacity-75 hover:plasmo-opacity-100">
      <Brain width={48} height={48} className="plasmo-fill-red-600" />
      {loading && (
        <span className="plasmo-absolute plasmo-flex plasmo-bg-slate-100/50 plasmo-w-full plasmo-h-full plasmo-justify-center plasmo-items-center plasmo-rounded-lg plasmo-text-slate-500">
          <IconSpinner />
        </span>
      )}
    </button>
  )
}