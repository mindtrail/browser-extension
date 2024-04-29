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
      className={`font-sans z-50 fixed group right-2 drop-shadow-xl w-80 h-[900px]
        flex flex-col bg-white bottom-4 border rounded-lg ${
          !isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
    >
      {/* <Button onClick={toggleSidebar} variant='ghost'> */}
      <div className='flex items-center py-2 px-4 gap-2 border-b'>
        {/* <XIcon className='w-4 h-4' /> */}
        {/* </Button> */}
        <Typography variant='h5'>RPA Copilot</Typography>
      </div>
      <FlowRecorder />
      <FlowRunner />
    </div>
  )
}
