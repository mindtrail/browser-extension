import { useCallback, useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { XIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { ProcessIcon } from '~/components/icons/process'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { useRecorderState } from '~/lib/hooks/use-recorder-state'
import { ACTIVE_TAB } from '~/lib/constants'
import { handleEscapeKey } from '~lib/utils/recorder/event-handlers/ui-state/dom-events'

import { FlowRunner } from './runner'
import { FlowRecorder, RecordButton } from './recorder'

interface SidebarRPAProps {
  settings: SettingsStored
  setSettings: Dispatch<SetStateAction<SettingsStored>>
}

export const SidebarRPA = ({ settings, setSettings }: SidebarRPAProps) => {
  const { isSidebarOpen, activeTab } = settings

  const { isRecording, isPaused, isSaving, toggleRecording, togglePause } =
    useRecorderState()

  const toggleSidebar = useCallback(
    () => setSettings((settings) => ({ ...settings, isSidebarOpen: !isSidebarOpen })),
    [isSidebarOpen, setSettings],
  )

  const changeTab = useCallback(
    (tab: string) => setSettings((settings) => ({ ...settings, activeTab: tab })),
    [setSettings],
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => handleEscapeKey(e, toggleSidebar)

    if (!isRecording) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [toggleSidebar, isRecording])

  return (
    <div
      className={`fixed right-2 bottom-4 flex flex-col transition-all duration-100
        font-sans text-foreground bg-white border rounded-lg drop-shadow-xl
        ${isSidebarOpen ? 'h-[70vh] w-80' : 'h-11 w-11 items-center justify-center'}
      `}
    >
      {isSidebarOpen ? (
        <>
          <Tabs
            defaultValue={ACTIVE_TAB.MAIN}
            value={activeTab}
            className='flex flex-col flex-1 opacity-0 animate-fadeIn'
          >
            <TabsContent
              value={ACTIVE_TAB.MAIN}
              className='flex flex-col data-[state=active]:flex-1 mt-0'
            >
              <div className='p-4'>Chat... this will be the main screen</div>
            </TabsContent>
            <TabsContent
              value={ACTIVE_TAB.FLOWS}
              className='flex flex-col data-[state=active]:flex-1 mt-0'
            >
              <div className='flex flex-col flex-1 justify-between gap-2 p-4'>
                <FlowRunner />

                <div className='w-full'>
                  <RecordButton
                    onToggleRecording={toggleRecording}
                    isRecording={isRecording}
                    isPaused={isPaused}
                    isSaving={isSaving}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsList className='flex justify-start px-4 gap-2 relative items-center'>
              <TabsTrigger
                value={ACTIVE_TAB.MAIN}
                className='h-10 rounded-ss-none rounded-se-none'
                onClick={() => changeTab(ACTIVE_TAB.MAIN)}
              >
                <ProcessIcon className='w-6 h-6 text-primary/70' />
              </TabsTrigger>

              <TabsTrigger
                value={ACTIVE_TAB.FLOWS}
                className='h-10 rounded-ss-none rounded-se-none'
                onClick={() => changeTab(ACTIVE_TAB.FLOWS)}
              >
                Flows
              </TabsTrigger>

              <Button
                onClick={toggleSidebar}
                variant='ghost'
                className='absolute right-0 text-foreground/50'
              >
                <XIcon className='w-4 h-4' />
              </Button>
            </TabsList>
          </Tabs>

          <FlowRecorder />
        </>
      ) : (
        <Button
          onClick={toggleSidebar}
          variant='ghost'
          size='icon'
          className='opacity-0 animate-fadeIn'
        >
          <ProcessIcon className='w-8 h-8 tex text-primary/70' />
        </Button>
      )}
    </div>
  )
}
