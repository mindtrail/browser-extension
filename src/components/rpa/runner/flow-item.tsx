import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { SendHorizonalIcon, Trash2Icon, CheckCheckIcon } from 'lucide-react'
import { Button } from '~components/ui/button'

interface FlowItemProps {
  flow: any
  runFlow: (flowId: string) => Promise<void>
  removeFlow: (flowId: string) => void
  flowsRunning: string[]
}

export function FlowItem({ flow, flowsRunning, runFlow, removeFlow }: FlowItemProps) {
  const { id: flowId, name } = flow
  if (!flowId) return null

  return (
    <div className='flex items-center relative group/runner'>
      <Button
        variant={flowsRunning?.includes(flowId) ? 'default' : 'secondary'}
        className='w-full line-clamp-2 h-auto justify-start text-left'
        onClick={() => runFlow(flowId)}
      >
        {name}
      </Button>
      <Button
        variant='ghost'
        className={`absolute right-0 rounded opacity-0
          group-hover/runner:opacity-100 transition ease-in-out`}
        onClick={() => removeFlow(flowId)}
      >
        <Trash2Icon className='w-4 h-4 text-foreground/70' />
      </Button>
    </div>
  )
}
