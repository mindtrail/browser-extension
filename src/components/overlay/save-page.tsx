import Brain from 'react:~/assets/brain.svg'

import { Button } from '~/components/ui/button'

// import {
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger,
// } from '~/components/ui/tooltip'

import { IconSpinner } from '../icon-spinner'

interface SavePageProps {
  handleClick: () => void
  loading: boolean
}

export const SavePage = ({ handleClick, loading }: SavePageProps) => {
  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      variant="secondary"
      className={`relative py-4 px-0 rounded-full bg-gradient-to-b from-primary to-[#F74296]
        opacity-75
        group-hover:from-primary/50  group-hover:to-[#F74296]/50 group-hover:bg-white
        group-hover:opacity-100 group-hover:animate-slide-to-left `}>
      <Brain width={48} height={48} />
      {loading && (
        <span className="absolute flex bg-slate-100/50 w-full h-full justify-center items-center  text-slate-500">
          <IconSpinner />
        </span>
      )}
    </Button>
  )
}
