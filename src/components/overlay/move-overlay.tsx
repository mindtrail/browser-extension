import { CaretDownIcon, CaretUpIcon } from '@radix-ui/react-icons'

import { Button } from '~/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip'
import { MoveDirection, OverlayPosition } from '~/lib/constants'
import { cn } from '~/lib/utils'

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
    (currentPos === OverlayPosition.top && direction === MoveDirection.up) ||
    (currentPos === OverlayPosition.bottom && direction === MoveDirection.down)

  if (isNotVisible) {
    return null
  }

  const Icon = direction === MoveDirection.up ? CaretUpIcon : CaretDownIcon
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={() => handleClick(direction)}
          variant="secondary"
          className={cn(
            `relative -right-4 px-1 py-4 w-9 rounded-full group-hover:animate-slide-to-left`,
            className
          )}>
          <Icon width={24} height={24} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Move {direction}</TooltipContent>
    </Tooltip>
  )
}
