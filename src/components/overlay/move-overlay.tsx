import { CaretUpIcon, CaretDownIcon } from '@radix-ui/react-icons'
import { Button } from '~/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip'

export enum OverlayPosition {
  top = 'top',
  bottom = 'bottom',
  center = 'center',
}

export enum MoveDirection {
  top = OverlayPosition.top,
  bottom = OverlayPosition.bottom,
}

interface MoveOverlayProps {
  handleClick: (direction: MoveDirection) => void
  direction: MoveDirection
  currentPos: OverlayPosition
}

export const MoveOverlay = ({
  handleClick,
  direction,
  currentPos = OverlayPosition.top,
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
          className="relative py-4 px-0 rounded-l-2xl overflow-hidden bg-primary opacity-50 hover:bg-white hover:opacity-100">
          <Icon width={24} height={24} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Store in Mind Trail</TooltipContent>
    </Tooltip>
  )
}
