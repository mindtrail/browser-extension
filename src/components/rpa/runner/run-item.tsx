import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from '~/components/ui/dropdown-menu'
import { EllipsisVerticalIcon } from 'lucide-react'
import { Button } from '~components/ui/button'
import { Typography } from '~components/typography'

import { Events } from '../events'

// const mock_event = {
//   id: Date.now(),
//   delay: 0,
//   name: '',
//   selector: 'label > button',
//   textContent: 'BUTTON',
//   type: 'click',
//   value: undefined,
// }

interface RunItemProps {
  flow: any
  runFlow: (flowId: string) => Promise<void>
  removeFlow: (flowId: string) => void
  flowsRunning: string[]
  runComplete: boolean
  runnerContainerRef: React.RefObject<HTMLDivElement>
}

export function RunItem(props: RunItemProps) {
  const { flow, flowsRunning, runComplete, runnerContainerRef, runFlow, removeFlow } =
    props
  const { id: flowId, name, events } = flow

  if (!flowId) return null

  return (
    <div className='flex items-center relative group/runner'>
      <Typography
        variant='small'
        className={`w-full line-clamp-2 h-auto justify-start text-left px-4 py-4 cursor-default bg-slate-50 rounded
        ${flowsRunning?.includes(flowId) ? 'text-primary' : 'text-foreground/70'}
        `}
        onClick={() => runFlow(flowId)}
      >
        {name}
      </Typography>
      <div
        className='flex absolute right-0 gap-2 opacity-0 bg-background rounded-sm
        group-hover/runner:opacity-100 transition ease-in-out'
      >
        <Button size='sm'>Run</Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
            >
              <EllipsisVerticalIcon className='h-4 w-4' />
              <span className='sr-only'>Open menu</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuPortal container={runnerContainerRef.current}>
            <DropdownMenuContent
              align='start'
              alignOffset={-5}
              className='w-[200px]'
              forceMount
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem>Rename</DropdownMenuItem>
              <DropdownMenuItem onClick={() => removeFlow(flowId)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      </div>

      {/* <div className='flex flex-col max-h-[50%] overflow-auto'>
        <Events eventsList={events} readOnly={true} />
      </div>

      {runComplete && flowsRunning?.length > 0 && (
        <Typography
          variant='small-semi'
          className='flex items-center gap-2 px-6 text-primary'
        >
          <CheckCheckIcon className='w-5 h-5' />
          Run complete
        </Typography>
      )} */}
    </div>
  )
}
