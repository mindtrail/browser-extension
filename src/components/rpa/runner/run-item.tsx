import { useState, useCallback } from 'react'

import { EllipsisVerticalIcon, CirclePlayIcon, SaveIcon } from 'lucide-react'
import { Button } from '~components/ui/button'
import { Typography } from '~components/typography'
import { Input } from '~/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from '~/components/ui/dropdown-menu'

import { Events } from '../events'

interface RunItemProps {
  flow: any
  flowsRunning: string[]
  runComplete: boolean
  runnerContainerRef: React.RefObject<HTMLDivElement>
  runFlow: (flowId: string) => Promise<void>
  removeFlow: (flowId: string) => void
  updateFlowName: (flowId: string, name: string) => Promise<void>
}

export function RunItem(props: RunItemProps) {
  const {
    flow,
    flowsRunning,
    runComplete,
    runnerContainerRef,
    runFlow,
    removeFlow,
    updateFlowName,
  } = props

  const { id: flowId, name, events } = flow
  const [isRenaming, setIsRenaming] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [flowName, setFlowName] = useState(name)

  const handleUpdateFlowName = useCallback(async () => {
    setIsSaving(true)
    await updateFlowName(flowId, flowName)
    setIsRenaming(false)
    setIsSaving(false)
  }, [flowId, flowName, updateFlowName])

  if (!flowId) return null

  return (
    <div className='flex items-center relative group/runner'>
      {!isRenaming ? (
        <Typography
          variant='small'
          className={`w-full line-clamp-2 h-auto justify-start text-left px-4 py-4 cursor-default bg-slate-50 rounded
        ${flowsRunning?.includes(flowId) ? 'text-primary' : 'text-foreground/70'}
        `}
        >
          {name}
        </Typography>
      ) : (
        <>
          <Input
            className='pr-12'
            value={flowName}
            onChange={(e) => setFlowName(e.target.value)}
          />
          <Button
            variant='ghost'
            disabled={isSaving}
            className={`absolute right-0`}
            onClick={handleUpdateFlowName}
          >
            <SaveIcon className='w-4 h-4' />
          </Button>
        </>
      )}

      {!isRenaming && (
        <div
          className='flex absolute right-0 gap-2 opacity-0 bg-background rounded-sm
        group-hover/runner:opacity-100 transition ease-in-out'
        >
          <Button
            variant='default'
            size='sm'
            className='flex gap-2'
            onClick={() => runFlow(flowId)}
          >
            <CirclePlayIcon className='w-4 h-4' />
            Run
          </Button>

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
                <DropdownMenuItem onClick={() => setIsRenaming(true)}>
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => removeFlow(flowId)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenu>
        </div>
      )}

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

// const mock_event = {
//   id: Date.now(),
//   delay: 0,
//   name: '',
//   selector: 'label > button',
//   textContent: 'BUTTON',
//   type: 'click',
//   value: undefined,
// }
