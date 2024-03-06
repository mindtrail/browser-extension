import Brain from 'react:~/assets/brain.svg'

import { IconSpinner } from '~/components/icon-spinner'
import { Button } from '~/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'

interface SavePageProps {
  handleClick: () => void
  loading: boolean
  currentPageIsSaved: boolean
}

const SAVE_BTN_COLORS = {
  UNSAVED: 'from-primary to-[#F74296] hover:from-primary/60  hover:to-[#F74296]/60',
  SAVED: 'from-[#076b1b]  to-[#42f74b] hover:from-[#076b1b]/80  hover:to-[#42f74b]/80',
}

export const SavePage = ({ handleClick, loading, currentPageIsSaved }: SavePageProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={handleClick}
          disabled={loading}
          variant='secondary'
          className={`relative py-4 px-0 rounded-full opacity-75 bg-gradient-to-b
            ${currentPageIsSaved ? SAVE_BTN_COLORS.SAVED : SAVE_BTN_COLORS.UNSAVED}
            group-hover:opacity-100 group-hover:animate-slide-to-left disabled:opacity-80
          `}
        >
          <Brain width={48} height={48} />
          {loading && (
            <span className='absolute flex bg-slate-100/60 w-full h-full justify-center items-center  text-slate-500 rounded-full'>
              <IconSpinner />
            </span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side='left'>
        {currentPageIsSaved ? 'Page Saved' : 'Save Page'}
      </TooltipContent>
    </Tooltip>
  )
}
