import { ChevronUpIcon, ChevronDownIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'

import { MoveDirection, OverlayPosition } from '~/lib/constants'
import { cn } from '~lib/utils'

interface ChangePositionProps {
  handleClick: (direction: MoveDirection) => void
  direction: MoveDirection
  currentPos: OverlayPosition
  className?: string
}

export const ChangePosition = ({
  handleClick,
  direction,
  currentPos = OverlayPosition.top,
  className,
}: ChangePositionProps) => {
  const isNotVisible =
    (currentPos === OverlayPosition.top && direction === MoveDirection.up) ||
    (currentPos === OverlayPosition.bottom && direction === MoveDirection.down)

  if (isNotVisible) {
    return null
  }

  const Icon = direction === MoveDirection.up ? ChevronUpIcon : ChevronDownIcon
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={() => handleClick(direction)}
          variant='secondary'
          className={cn(
            `relative -right-4 px-1 py-4 w-9 rounded-full group-hover:animate-slide-to-left
            hover:bg-white`,
            className,
          )}
        >
          <Icon width={24} height={24} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side='left'>Move {direction}</TooltipContent>
    </Tooltip>
  )
}
