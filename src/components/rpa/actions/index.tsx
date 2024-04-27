// import { XIcon } from 'lucide-react'

// import { Typography } from '~components/typography'
// import { Button } from '~/components/ui/button'

import { Action } from './action'
import { MousePointerClickIcon, GlobeIcon, PenLineIcon } from 'lucide-react'

export function Actions({ events, debugMode = false }) {
  if (!events?.length) return null

  const actions = events.map((event) => {
    const value = event.value || event.textContent;
    return {
      type: event.type,
      selector: event.selector,
      value: debugMode ? `${event.selector}: ${value}` : value,
      icon: (() => {
        switch (event.type) {
          case 'input':
            return PenLineIcon
          case 'click':
            return MousePointerClickIcon
          default:
            return GlobeIcon
        }
      })(),
    }
  })

  return (
    <div className='flex flex-col w-full px-2 py-2 cursor-default'>
      {actions.map(({ type, value, icon: Icon }, index) => (
        <Action Icon={Icon} type={type} value={value} key={index} />
      ))}

      {/* <div
        className={`flex items-center gap-4 px-2 py-4 w-full
              rounded-lg border border-dashed`}
      >
        <div className='w-8 h-8 rounded-full border border-dashed bg-accent/50' />
        <div className='flex flex-col gap-1'>
          <Typography className='capitalize text-foreground/50' variant='small-semi'>
            Next action
          </Typography>
        </div>
        <Button
          variant='secondary'
          className={`invisible group-hover/row:visible absolute right-4`}
        >
          <XIcon className='w-4 h-4' />
        </Button>
      </div> */}
    </div>
  )
}
