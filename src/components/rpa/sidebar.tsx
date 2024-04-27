import { useReducer, useState } from 'react'
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
  const [flows, setFlows] = useState(() =>
    JSON.parse(localStorage.getItem('flows') || '{}'),
  )

  return (
    <div
      className={`font-sans z-50 fixed group right-0 drop-shadow-xl w-80 h-full
        flex flex-col bg-white ${!isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className='flex items-center py-2 gap-2 border-b'>
        <Button onClick={toggleSidebar} variant='ghost'>
          <XIcon className='w-4 h-4' />
        </Button>
        <Typography variant='h5'> Super RPA</Typography>
      </div>
      <FlowRecorder flows={flows} setFlows={setFlows} />
      <FlowRunner flows={flows} setFlows={setFlows} />
    </div>
  )
}
