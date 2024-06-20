import type { Dispatch, SetStateAction } from 'react'
import { ChevronDownIcon, XIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { ProcessIcon } from '~/components/icons/process'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'

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
      className={`fixed right-2 bottom-4 flex flex-col
        font-sans text-foreground bg-white border rounded-lg drop-shadow-xl
        ${isSidebarOpen ? 'h-[70vh] w-80' : 'h-auto w-auto'}
      `}
    >
      {isSidebarOpen ? (
        <div className='flex flex-col'>
          <Tabs defaultValue='recorder'>
            <TabsList className='flex justify-start'>
              <TabsTrigger
                value='recorder'
                className='h-10 rounded-es-none rounded-ee-none'
              >
                <ProcessIcon className='w-6 h-6 text-primary/70' />
              </TabsTrigger>

              <TabsTrigger
                value='runner'
                className='h-10 rounded-es-none rounded-ee-none'
              >
                Flows
              </TabsTrigger>
            </TabsList>

            <TabsContent value='recorder' className='flex flex-col flex-1'>
              Chat... this will be the main screen
            </TabsContent>
            <TabsContent value='runner' className='flex flex-col flex-1'>
              <FlowRunner />
              <FlowRecorder />
            </TabsContent>
          </Tabs>

          <Button
            onClick={toggleSidebar}
            variant='ghost'
            className='absolute right-0 top-0.5 text-foreground/50'
          >
            <XIcon className='w-4 h-4' />
          </Button>
        </div>
      ) : (
        <Button onClick={toggleSidebar} variant='ghost' size='icon'>
          <ProcessIcon className='w-8 h-8 text-primary/70' />
        </Button>
      )}
    </div>
  )
}
