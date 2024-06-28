import { useCallback, useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { XIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { ProcessIcon } from '~/components/icons/process'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { useRecorderState } from '~/lib/hooks/use-recorder-state'
import { useAssistant } from '~/lib/hooks/use-assistant'
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
  const { uploadFile, parseFile, assistantStatus, assistantResponse } = useAssistant()

  const toggleSidebar = useCallback(
    () => setSettings((settings) => ({ ...settings, isSidebarOpen: !isSidebarOpen })),
    [isSidebarOpen, setSettings],
  )

  const changeTab = useCallback(
    (tab: string) => setSettings((settings) => ({ ...settings, activeTab: tab })),
    [setSettings],
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) =>
      isSidebarOpen && handleEscapeKey(e, toggleSidebar)

    if (!isRecording) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [toggleSidebar, isRecording, isSidebarOpen])

  return (
    <div
      className={`fixed right-2 bottom-4 flex flex-col transition-all duration-100
        font-sans text-foreground bg-white rounded-lg drop-shadow-xl
        ${!isSidebarOpen
          ? 'h-11 w-11 items-center justify-center'
          : isRecording
            ? 'h-auto w-80'
            : 'h-[70vh] w-80'
        }
      `}
    >
      {isSidebarOpen ? (
        <>
          <Tabs
            defaultValue={ACTIVE_TAB.MAIN}
            value={activeTab}
            className={`flex flex-col flex-1 opacity-0 animate-fadeIn ${isRecording ? 'hidden' : ''
              }`}
          >
            <TabsContent
              value={ACTIVE_TAB.MAIN}
              className='flex flex-col data-[state=active]:flex-1 mt-0'
            >
              <div className='p-4'>
                <Button variant='ghost'>
                  <input
                    type='file'
                    name='file'
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      await uploadFile(file)
                      await parseFile()
                    }}
                  />
                </Button>
                {assistantStatus === 'file_upload_pending' && 'Uploading file...'}
                {assistantStatus === 'file_parsing_pending' && 'Parsing file...'}
                {assistantResponse && (
                  <pre className='text-xs overflow-auto max-h-[60vh]'>
                    {JSON.stringify(assistantResponse, null, 2)}
                  </pre>
                )}
              </div>
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

            <TabsList className='flex h-11 justify-start px-4 gap-2 relative items-center'>
              <TabsTrigger
                value={ACTIVE_TAB.MAIN}
                className='h-11 rounded-ss-none rounded-se-none'
                onClick={() => changeTab(ACTIVE_TAB.MAIN)}
              >
                <ProcessIcon className='w-6 h-6 text-primary/70' />
              </TabsTrigger>

              <TabsTrigger
                value={ACTIVE_TAB.FLOWS}
                className='h-11 rounded-ss-none rounded-se-none'
                onClick={() => changeTab(ACTIVE_TAB.FLOWS)}
              >
                Flows
              </TabsTrigger>

              <Button
                onClick={toggleSidebar}
                variant='ghost'
                size='icon'
                className='absolute right-1 text-foreground/50'
              >
                <XIcon className='w-5 h-5' />
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
