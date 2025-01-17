import { cn } from '~lib/utils'

export function ProcessIcon({ className }: React.ComponentProps<'svg'>) {
  return (
    <svg
      className={cn('h-5 w-5', className)}
      fill='currentColor'
      xmlns='http://www.w3.org/2000/svg'
      width='800px'
      height='800px'
      viewBox='0 0 52 52'
      enableBackground='new 0 0 52 52'
    >
      <path
        d='M16.2,23.2l8.5-10.6c0.6-0.8,1.8-0.8,2.4,0l8.5,10.7c0.3,0.4,0.7,0.7,1.2,0.7h9.6c0.8,0,1.6-0.7,1.6-1.5V8
	c0-2.2-1.9-4-4.1-4H8C5.8,4,4,5.8,4,8v14.5C4,23.3,4.7,24,5.5,24H15C15.5,24,15.9,23.6,16.2,23.2z'
      />
      <path
        d='M35.7,28.8l-8.5,10.6c-0.6,0.8-1.8,0.8-2.4,0l-8.5-10.7C15.9,28.4,15.5,28,15,28H5.5C4.7,28,4,28.7,4,29.5
	V44c0,2.2,1.8,4,4,4h36c2.2,0,4-1.8,4-4V29.5c0-0.8-0.7-1.5-1.5-1.5h-9.6C36.4,28,36,28.4,35.7,28.8z'
      />
    </svg>
  )
}
