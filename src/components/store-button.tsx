import Brain from 'react:~/assets/brain.svg'

import { Button } from '~/components/ui/button'

import { IconSpinner } from './icon-spinner'

interface StoreButtonProps {
  handleClick: () => void
  loading: boolean
}

export const StoreButton = ({ handleClick, loading }: StoreButtonProps) => {
  return (
    <Button
      title="Store in Mind Trail"
      onClick={handleClick}
      disabled={loading}
      className="relative py-4 px-0 rounded-s-2xl overflow-hidden bg-white opacity-70 hover:bg-white hover:opacity-100">
      <Brain width={48} height={48} className="fill-red-600" />
      {loading && (
        <span className="absolute flex bg-slate-100/50 w-full h-full justify-center items-center  text-slate-500">
          <IconSpinner />
        </span>
      )}
    </Button>
  )
}
