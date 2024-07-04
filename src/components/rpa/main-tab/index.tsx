import { Button } from '~/components/ui/button'
import { useAssistant } from '~/lib/hooks/use-assistant'

export const MainTab = () => {
  const { uploadFile, parseFile, assistantStatus, assistantResponse } = useAssistant()

  return (
    <div className='p-4'>
      <Button variant='ghost'>
        <input
          type='file'
          name='file'
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            await uploadFile(file)
            await parseFile()
          }}
        />
      </Button>
      {assistantStatus === 'file_upload_pending' && 'Uploading file...'}
      {assistantStatus === 'file_parse_pending' && 'Parsing file...'}
      {assistantResponse && (
        <pre className='text-xs overflow-auto max-h-[60vh]'>
          {JSON.stringify(assistantResponse, null, 2)}
        </pre>
      )}
    </div>
  )
}
