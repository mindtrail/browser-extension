import { CaretUpIcon, CaretDownIcon } from '@radix-ui/react-icons'
import { Button } from '~/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip'

import { cn } from '~/lib/utils'
import { MoveDirection, OverlayPosition } from '~/lib/constants'

interface MoveOverlayProps {
  handleClick: (direction: MoveDirection) => void
  direction: MoveDirection
  currentPos: OverlayPosition
  className?: string
}

export const MoveOverlay = ({
  handleClick,
  direction,
  currentPos = OverlayPosition.top,
  className,
}: MoveOverlayProps) => {
  const isNotVisible =
    (currentPos === OverlayPosition.top && direction === MoveDirection.top) ||
    (currentPos === OverlayPosition.bottom &&
      direction === MoveDirection.bottom)

  if (isNotVisible) {
    return null
  }

  const Icon = direction === MoveDirection.top ? CaretUpIcon : CaretDownIcon
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={() => handleClick(direction)}
          variant="outline"
          className={cn(
            `relative -right-4 py-4 px-0 rounded-full group-hover:animate-slide-to-left`,
            className
          )}>
          <Icon width={24} height={24} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Store in Mind Trail</TooltipContent>
    </Tooltip>
  )
}
