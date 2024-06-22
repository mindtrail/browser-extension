import type { Dispatch, SetStateAction } from 'react'
import { XIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { ProcessIcon } from '~/components/icons/process'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { useRecorderState } from '~/lib/hooks/use-recorder-state'
import { ACTIVE_TAB } from '~/lib/constants'
import { useSettingsStorage } from '~lib/hooks/use-storage'

import { FlowRunner } from './runner'
import { FlowRecorder, RecordButton } from './recorder'

export const SidebarRPA = () => {
  const [settings, setSettings] = useSettingsStorage()
  const { isSidebarOpen, activeTab } = settings

  const { isRecording, isPaused, isSaving, toggleRecording, togglePause } =
    useRecorderState()

  const toggleSidebar = () =>
    setSettings((settings) => ({ ...settings, isSidebarOpen: !isSidebarOpen }))

  const changeTab = (tab: string) =>
    setSettings((settings) => ({ ...settings, activeTab: tab }))

  return (
    <div
      className={`fixed right-2 bottom-4 flex flex-col h-auto w-auto
        font-sans text-foreground bg-white border rounded-lg drop-shadow-xl
        ${isSidebarOpen ? '!h-[70vh] !w-80' : ''}
      `}
    >
      {isSidebarOpen ? (
        <>
          <Tabs defaultValue={activeTab} className='h-full'>
            <TabsList className='flex justify-start px-4 gap-2'>
              <TabsTrigger
                value={ACTIVE_TAB.MAIN}
                className='h-10 rounded-es-none rounded-ee-none'
                onClick={() => changeTab(ACTIVE_TAB.MAIN)}
              >
                <ProcessIcon className='w-6 h-6 text-primary/70' />
              </TabsTrigger>

              <TabsTrigger
                value={ACTIVE_TAB.FLOWS}
                className='h-10 rounded-es-none rounded-ee-none'
                onClick={() => changeTab(ACTIVE_TAB.FLOWS)}
              >
                Flows
              </TabsTrigger>
            </TabsList>

            <TabsContent value={ACTIVE_TAB.MAIN} className='flex flex-col'>
              Chat... this will be the main screen
            </TabsContent>
            <TabsContent value={ACTIVE_TAB.FLOWS} asChild>
              <div className='h-[calc(100%-56px)] flex flex-col justify-between gap-2 pb-2'>
                <FlowRunner />

                <div className='w-full px-4'>
                  <RecordButton
                    onToggleRecording={toggleRecording}
                    onPause={togglePause}
                    isRecording={isRecording}
                    isPaused={isPaused}
                    isSaving={isSaving}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <FlowRecorder />

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
