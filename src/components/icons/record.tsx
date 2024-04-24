import { cn } from '~/lib/utils'

export function RecordIcon({ className }: React.ComponentProps<'svg'>) {
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
        d='M10 7.5C10 8.88071 8.88071 10 7.5 10C6.11929 10 5 8.88071 5 7.5C5 6.11929 6.11929 5 7.5 5C8.88071 5 10 6.11929 10 7.5Z'
        fill='#D90404'
      />
    </svg>
  )
}
