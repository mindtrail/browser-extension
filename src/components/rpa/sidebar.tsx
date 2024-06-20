import { useReducer } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'

import { Typography } from '~components/typography'
import { Button } from '~/components/ui/button'

import { FlowRecorder } from './recorder'
import { FlowRunner } from './runner'

interface SidebarRPAProps {
  settings: SettingsStored
  setSettings: Dispatch<SetStateAction<SettingsStored>>
}

export const SidebarRPA = ({ settings, setSettings }: SidebarRPAProps) => {
  const { isSidebarOpen } = settings
  const VisibilityIcon = isSidebarOpen ? ChevronDownIcon : ChevronUpIcon

  const toggleSidebar = () =>
    setSettings((settings) => ({ ...settings, isSidebarOpen: !settings.isSidebarOpen }))

  return (
    <div
      className={`font-sans text-foreground fixed right-2 bottom-4
        flex flex-col bg-white border rounded-lg drop-shadow-xl
        ${isSidebarOpen ? 'h-[70vh] w-80' : 'h-[50px] w-auto'}
      `}
    >
      <div className='flex items-center py-2 px-4 gap-2 border-b'>
        <Button onClick={toggleSidebar} variant='ghost'>
          <VisibilityIcon className='w-4 h-4' />
        </Button>
        <Typography variant='h5'>RPA Copilot</Typography>
      </div>
      {isSidebarOpen && (
        <div className='flex flex-col flex-1'>
          <FlowRunner />
          <FlowRecorder />
        </div>
      )}
    </div>
  )
}
