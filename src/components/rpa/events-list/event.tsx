import { Trash2Icon } from 'lucide-react'

import { Typography } from '~components/typography'
import { Button } from '~/components/ui/button'

interface Event {
  type: string
  value: string
  icon: typeof Trash2Icon
  count?: number
}

interface EventProps {
  event: Event
  readOnly: boolean
  index: number
  removeEvent: (index: number) => void
}

export function Event({ event, readOnly, index, removeEvent }: EventProps) {
  const { type, value, icon: Icon, count } = event
  console.log(event)
  return (
    <div
      className={`flex items-center gap-4 px-4 py-2 w-full relative
        rounded-lg overflow-hidden border border-transparent group/row
        ${index % 2 === 0 ? 'bg-white' : ''}`}
    >
      <Icon className='h-5 w-5 shrink-0 text-foreground/50 group-hover/row:text-foreground' />
      <div className='flex flex-col flex-1 gap-1'>
        <Typography
          variant='small-semi'
          className='capitalize group-hover/row:text-foreground'
        >
          {type}
        </Typography>
        <Typography
          variant='small'
          className='group-hover/row:text-foreground max-w-[80%] text-ellipsis overflow-hidden whitespace-nowrap'
        >
          {value}
          {count > 1 && <span className='text-foreground/50'> ({count})</span>}
        </Typography>
      </div>
      {!readOnly && (
        <Button
          variant='secondary'
          className={`invisible group-hover/row:visible absolute right-0`}
          onClick={() => removeEvent(index)}
        >
          <Trash2Icon className='w-4 h-4' />
        </Button>
      )}
    </div>
  )
}

let lastClick = 0
let secondLastClick = 0
let totalClicks = 0
let target = null
let clickedObject = null
var rageThreshold = 6

function clickCounter(event) {
  totalClicks++
  if (totalClicks > rageThreshold) {
    totalClicks = 0
  }
  console.log(totalClicks)
}

function rageClick(event) {
  var now = Math.floor(Date.now())
  if (now - lastClick < 500 && now - secondLastClick && totalClicks >= rageThreshold) {
    console.log('rage click on element ' + clickedObject)
    //newrelic.addPageAction(clickedObject, 1);
  }

  secondLastClick = lastClick
  lastClick = now
  console.log(event.type + ' ' + now)
  console.log((now - secondLastClick) / 1000)
}
function clickedElement(element) {
  element = element || window.event
  ;(target = element.target || element.srcElement),
    (clickedObject = target.id || target.className)
  //console.log(text);
}
