import { OctagonXIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Typography } from '~components/typography'

type RecordButtonProps = {
  onClick: () => void
  className?: string
}
export function CancelRecordingButton(props: RecordButtonProps) {
  const { onClick, className = '' } = props

  return (
    <Button
      variant='outline'
      onClick={onClick}
      className={'flex w-full items-center gap-4'}
    >
      <OctagonXIcon className='w-5 h-5 text-foreground/70' />
      <Typography variant='small-semi'>Cancel (Esc)</Typography>
    </Button>
  )
}
