import { Button } from '~/components/ui/button'
import { RecordIcon } from '~/components/icons/record'

export function RecordButton({ onClick, recording }: { onClick: () => void, recording: boolean }) {

    return <div className='w-full flex px-4 py-4'>
        <Button variant={recording ? 'destructive' : 'outline'} size='lg' className='flex gap-4 items-center' onClick={onClick}>
            <RecordIcon className='w-5 h-5' />
            {recording ? 'Stop Recording' : 'Record Workflow'}
        </Button>
    </div>
}