import Brain from 'react:~/assets/brain.svg'

import { Button } from '~/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip'

import { IconSpinner } from './icon-spinner'

interface StoreButtonProps {
  handleClick: () => void
  loading: boolean
}

export const StoreButton = ({ handleClick, loading }: StoreButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
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
      </TooltipTrigger>
      <TooltipContent>Store in Mind Trail</TooltipContent>
    </Tooltip>
  )
}
