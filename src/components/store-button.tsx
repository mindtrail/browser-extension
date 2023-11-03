import Brain from 'react:~/assets/brain.svg'

import { IconSpinner } from './icon-spinner'

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
      className="relative flex flex-row items-center rounded-lg transition-all border-none shadow-lg hover:shadow-md active:scale-105 bg-slate-50 hover:bg-slate-100 opacity-75 hover:opacity-100">
      <Brain width={48} height={48} className="fill-red-600" />
      {loading && (
        <span className="absolute flex bg-slate-100/50 w-full h-full justify-center items-center rounded-lg text-slate-500">
          <IconSpinner />
        </span>
      )}
    </button>
  )
}
