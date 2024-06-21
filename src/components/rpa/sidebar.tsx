import type { Dispatch, SetStateAction } from 'react'
import { XIcon } from 'lucide-react'

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
        <>
          <Tabs defaultValue='flows' className='h-full'>
            <TabsList className='flex justify-start'>
              <TabsTrigger value='main' className='h-10 rounded-es-none rounded-ee-none'>
                <ProcessIcon className='w-6 h-6 text-primary/70' />
              </TabsTrigger>

              <TabsTrigger value='flows' className='h-10 rounded-es-none rounded-ee-none'>
                Flows
              </TabsTrigger>
            </TabsList>

            <TabsContent value='main' className='flex flex-col'>
              Chat... this will be the main screen
            </TabsContent>
            <TabsContent value='flows' asChild>
              <div className='flex flex-col h-[calc(100%-56px)]'>
                <FlowRunner />
                <FlowRecorder />
              </div>
            </TabsContent>
          </Tabs>

          <Button
            onClick={toggleSidebar}
            variant='ghost'
            className='absolute right-0 top-0.5 text-foreground/50'
          >
            <XIcon className='w-4 h-4' />
          </Button>
        </>
      ) : (
        <Button onClick={toggleSidebar} variant='ghost' size='icon'>
          <ProcessIcon className='w-8 h-8 text-primary/70' />
        </Button>
      )}
    </div>
  )
}
