import { cn } from '~lib/utils'

export function StartRecordingIcon({ className }: React.ComponentProps<'svg'>) {
  return (
    <svg
      className={cn('h-4 w-4', className)}
      viewBox='0 0 15 15'
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
    >
      <path
        d='M7.49988 13.6477C10.8952 13.6477 13.6477 10.8952 13.6477 7.49989C13.6477 4.10454 10.8952 1.35206 7.49988 1.35206C4.10453 1.35206 1.35205 4.10454 1.35205 7.49989C1.35205 10.8952 4.10453 13.6477 7.49988 13.6477Z'
        stroke='currentColor'
        strokeWidth='1.5'
      />
      <path
        d='M11 7.5C11 9.433 9.433 11 7.5 11C5.567 11 4 9.433 4 7.5C4 5.567 5.567 4 7.5 4C9.433 4 11 5.567 11 7.5Z'
        fill='currentColor'
      />
    </svg>
  )
}

export function StopRecordingIcon({ className }: React.ComponentProps<'svg'>) {
  return (
    <svg
      className={cn('h-4 w-4', className)}
      viewBox='0 0 15 15'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M15 7.5C15 11.6421 11.6421 15 7.5 15C3.35786 15 -1.43051e-06 11.6421 -1.43051e-06 7.5C-1.43051e-06 3.35786 3.35786 0 7.5 0C11.6421 0 15 3.35786 15 7.5Z'
        fill='currentColor'
      />
      <path
        d='M4.5 5.03572C4.49999 4.5 4.50001 4.5 5.03572 4.5H9.96429C10.5 4.5 10.5 4.5 10.5 5.03572L10.5 9.96429C10.5 10.5 10.5 10.5 9.96428 10.5H5.0357C4.49999 10.5 4.49999 10.5 4.49999 9.96429L4.5 5.03572Z'
        fill='white'
      />
    </svg>
  )
}
