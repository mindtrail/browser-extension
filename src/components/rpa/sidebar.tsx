import { useReducer } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { XIcon } from 'lucide-react'

import { Typography } from '~components/typography'
import { Button } from '~/components/ui/button'

import { FlowRecorder } from './recorder'
import { FlowRunner } from './runner'

interface SidebarProps {
  settings: SettingsStored
  setSettings: Dispatch<SetStateAction<SettingsStored>>
}

export const RightSidebar = ({ setSettings }: SidebarProps) => {
  const [isSidebarOpen, toggleSidebar] = useReducer((c) => !c, false)

  return (
    <div
      className={`font-sans text-foreground fixed right-2 bottom-4 z-50
        flex flex-col w-80 h-[900px] bg-white border rounded-lg drop-shadow-xl
        ${!isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      <div className='flex items-center py-2 px-4 gap-2 border-b'>
        <Button onClick={toggleSidebar} variant='ghost'>
          <XIcon className='w-4 h-4' />
        </Button>
        <Typography variant='h5'>RPA Copilot</Typography>
      </div>
      <div className='flex flex-col justify-between flex-1 overflow-auto'>
        <FlowRunner />
        <FlowRecorder />
      </div>
    </div>
  )
}
