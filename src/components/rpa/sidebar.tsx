import type { Dispatch, SetStateAction } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'

import { Typography } from '~components/typography'
import { Button } from '~/components/ui/button'
import { ProcessIcon } from '~components/icons/process'

import { FlowRecorder } from './recorder'
import { FlowRunner } from './runner'

interface SidebarRPAProps {
  settings: SettingsStored
  setSettings: Dispatch<SetStateAction<SettingsStored>>
}

export const SidebarRPA = ({ settings, setSettings }: SidebarRPAProps) => {
  const { isSidebarOpen } = settings

  const toggleSidebar = () =>
    setSettings((settings) => ({ ...settings, isSidebarOpen: !isSidebarOpen }))

  return (
    <div
      className={`fixed right-2 bottom-4 flex flex-col justify-center
        font-sans text-foreground bg-white border rounded-lg drop-shadow-xl
        ${isSidebarOpen ? 'h-[70vh] w-80' : 'h-auto w-auto'}
      `}
    >
      {isSidebarOpen ? (
        <>
          <div className='flex items-center py-2 px-4 gap-2 border-b'>
            <Button onClick={toggleSidebar} variant='ghost' size='icon'>
              <ChevronDownIcon className='w-5 h-5' />
            </Button>
            <Typography variant='semi'>EZ Process Automation</Typography>
          </div>

          <div className='flex flex-col flex-1'>
            <FlowRunner />
            <FlowRecorder />
          </div>
        </>
      ) : (
        <Button onClick={toggleSidebar} variant='ghost' size='icon' className='group'>
          <ProcessIcon className='w-8 h-8 text-primary/70' />
          <ChevronUpIcon className='w-5 h-5 text-primary/70 absolute hidden group-hover:block bg-white rounded-full' />
        </Button>
      )}
    </div>
  )
}
