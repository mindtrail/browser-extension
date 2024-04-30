import { Button } from '~/components/ui/button'
import { RecordIcon } from '~/components/icons/record'

export function RecordButton({
  onClick,
  recording,
}: {
  onClick: () => void
  recording: boolean
}) {
  return (
    <Button
      className='flex w-full gap-4 items-center'
      variant={recording ? 'destructive' : 'outline'}
      onClick={onClick}
    >
      <RecordIcon className='w-5 h-5' />
      {recording ? 'Save Recording' : 'Record New Workflow'}
    </Button>
  )
}
