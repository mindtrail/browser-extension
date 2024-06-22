import { cn } from '~lib/utils'

export function RecordIcon({ className }: React.ComponentProps<'svg'>) {
  return (
    <svg
      className={cn('h-4 w-4', className)}
      viewBox='0 0 15 15'
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
    >
      <path
        d='M7.49988 13.6477C10.8952 13.6477 13.6477 10.8952 13.6477 7.49989C13.6477 4.10454 10.8952 1.35206 7.49988 1.35206C4.10453 1.35206 1.35205 4.10454 1.35205 7.49989C1.35205 10.8952 4.10453 13.6477 7.49988 13.6477Z'
        stroke='#D90404'
        strokeWidth='1.5'
      />
      <path
        d='M11 7.5C11 9.433 9.433 11 7.5 11C5.567 11 4 9.433 4 7.5C4 5.567 5.567 4 7.5 4C9.433 4 11 5.567 11 7.5Z'
        fill='#D90404'
      />
    </svg>
  )
}

export function SaveRecordingIcon({ className }: React.ComponentProps<'svg'>) {
  return (
    <svg
      className={cn('h-4 w-4', className)}
      viewBox='0 0 15 15'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M7.49988 13.6477C10.8952 13.6477 13.6477 10.8952 13.6477 7.49989C13.6477 4.10454 10.8952 1.35206 7.49988 1.35206C4.10453 1.35206 1.35205 4.10454 1.35205 7.49989C1.35205 10.8952 4.10453 13.6477 7.49988 13.6477Z'
        stroke='currentColor'
      />
      <path
        d='M4.5 5C4.5 4.72386 4.72386 4.5 5 4.5H10C10.2761 4.5 10.5 4.72386 10.5 5V10C10.5 10.2761 10.2761 10.5 10 10.5H5C4.72386 10.5 4.5 10.2761 4.5 10V5Z'
        fill='#D90404'
      />
    </svg>
  )
}
