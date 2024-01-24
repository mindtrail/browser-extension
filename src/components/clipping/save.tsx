import { useCallback, useEffect, useReducer, useState } from 'react'
import type { MouseEvent } from 'react'

import { ClipboardCopyIcon } from '@radix-ui/react-icons'

import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { Button } from '~/components/ui/button'

import { IconSpinner } from '~/components/icon-spinner'

import { MESSAGES, MIN_TEXT_FOR_CLIPPING } from '~/lib/constants'
import {
  getClippingData,
  getClippingBtnPosition,
  isSelectionExcludedNode,
} from '~lib/clipping/save-clipping'

interface SaveClippingProps {
  addClippingToList: (payload: any) => void
}

export const SaveClipping = ({ addClippingToList }: SaveClippingProps) => {
  const [loading, toggleLoading] = useReducer((c) => !c, false)
  const [btnCoorindates, setBtnCoorindates] = useState(null)

  useEffect(() => {
    document.addEventListener('click', handlePageClick)
    // Return a cleanup function to remove the event listener
    return () => {
      document.removeEventListener('click', handlePageClick)
    }
  }, [])

  const handlePageClick = useCallback(() => {
    // "Click" event fires before "selectionchange".
    // To have correct data, the update fn is moved at the end of the event loop.
    setTimeout(() => {
      const selection = window.getSelection()

      if (selection?.isCollapsed) {
        setBtnCoorindates(null)
        return
      }

      const range = selection?.getRangeAt(0)
      const selectedText = selection.toString().trim()
      if (selectedText.length < MIN_TEXT_FOR_CLIPPING || isSelectionExcludedNode(range)) {
        setBtnCoorindates(null)
        return
      }

      const newCoordinates = getClippingBtnPosition(range)
      if (!newCoordinates) {
        return
      }

      setBtnCoorindates(newCoordinates)
    })
  }, [])

  const handleClippingSave = useCallback(async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    const selection = window.getSelection()
    const selectedText = selection?.toString()?.trim()
    const range = selection?.getRangeAt(0)

    if (selectedText?.length < MIN_TEXT_FOR_CLIPPING) {
      return
    }

    toggleLoading()
    const payload = getClippingData(range)
    console.log('Clipping Data', payload)

    const result = await chrome.runtime.sendMessage({
      message: MESSAGES.SAVE_CLIPPING,
      payload,
    })

    toggleLoading()
    if (result?.error) {
      alert('Error saving clipping. Please try again.')

      console.error(result.error)
      return
    }

    console.log(111, result)
    addClippingToList(payload)

    selection?.empty()
    setBtnCoorindates(null)
  }, [])

  if (!btnCoorindates) {
    return null
  }

  console.log(1234)
  const { left, top } = btnCoorindates

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={handleClippingSave}
          disabled={loading}
          variant='outline'
          style={{ transform: `translate(${left}px, ${top}px)` }}
          className={`p-1 rounded-full h-auto absolute z-[999]
              bg-white hover:bg-slate-200 text-accent-foreground/75
              transform transition-transform duration-200 ease-out
              disabled:opacity-80`}
        >
          <ClipboardCopyIcon width={22} height={22} />
          {loading && (
            <span className='absolute flex bg-slate-100/50 w-full h-full justify-center items-center rounded-full'>
              <IconSpinner />
            </span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side='bottom'>Save Selection</TooltipContent>
    </Tooltip>
  )
}
