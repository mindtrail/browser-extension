import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import type { MouseEvent } from 'react'

import { TrashIcon } from '@radix-ui/react-icons'

import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { Button } from '~/components/ui/button'

import { IconSpinner } from '~/components/icon-spinner'

import { MESSAGES } from '~/lib/constants'
import { HIGHLIGHT_CLASS } from '~/lib/constants'

interface DeleteClippingProps {
  clippingList: SavedClipping[]
}

const MAX_RETRIES = 3

export const DeleteClipping = ({ clippingList }: DeleteClippingProps) => {
  const [loading, toggleLoading] = useReducer((c) => !c, false)
  const [btnCoorindates, setBtnCoorindates] = useState({ left: 300, top: 400 })
  const [listenerRetryNr, setListenerRetryNr] = useState(0)
  const [hoveredHighlight, setHoveredHighlight] = useState('')
  const hideTimeout = useRef(null) // useRef to persist hideTimeout between renders

  useEffect(() => {
    if (listenerRetryNr >= MAX_RETRIES) {
      return
    }

    setTimeout(() => {
      addDeleteListener(clippingList)
    }, 2000) // This timeout needs to be bigger than the one on the parent Component
    return () => removeDeleteListener()
  }, [clippingList, listenerRetryNr])

  const handleMouseEnter = useCallback((event) => {
    const clippingId = event.target?.dataset?.highlightId
    if (!clippingId) {
      return
    }
    console.log(clippingId)

    clearTimeout(hideTimeout.current)
    setHoveredHighlight(clippingId)
  }, [])

  const handleMouseLeave = useCallback(() => {
    hideTimeout.current = setTimeout(() => {
      setHoveredHighlight('')
    }, 400)
  }, [])

  const handleDeleteBtnMouseEnter = useCallback(() => {
    clearTimeout(hideTimeout.current) // Clear the timeout to prevent hiding
  }, [])

  function addDeleteListener(clippingList: SavedClipping[]) {
    const highlightedElements = document.getElementsByClassName(HIGHLIGHT_CLASS)

    // In case the elements are not yet highlighted, retry after a few seconds
    if (highlightedElements.length === 0) {
      setListenerRetryNr(listenerRetryNr + 1)
      return
    }

    for (const element of highlightedElements) {
      element.addEventListener('mouseenter', handleMouseEnter)
      element.addEventListener('mouseleave', handleMouseLeave)
    }
  }

  function removeDeleteListener() {
    const highlightedElements = document.getElementsByClassName(HIGHLIGHT_CLASS)

    for (const element of highlightedElements) {
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }

  const handleDelete = useCallback(async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()

    toggleLoading()
    const payload = {}
    // console.log('Delete... ID', payload)

    const result = await chrome.runtime.sendMessage({
      message: MESSAGES.DELETE_CLIPPING,
      payload,
    })

    toggleLoading()
    if (result?.error) {
      alert('Error saving clipping. Please try again.')

      console.error(result.error)
      return
    }
    console.log(result)
    setBtnCoorindates(null)
  }, [])

  if (!btnCoorindates || !hoveredHighlight) {
    return null
  }

  const { left, top } = btnCoorindates

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={handleDelete}
          onMouseEnter={handleDeleteBtnMouseEnter}
          onMouseLeave={handleMouseLeave}
          disabled={loading}
          variant='outline'
          style={{ transform: `translate(${left}px, ${top}px)` }}
          className={`p-1 rounded-full h-auto absolute z-[999]
              bg-white hover:bg-slate-200 text-accent-foreground/75
              transform transition-transform duration-200 ease-out
              disabled:opacity-80`}
        >
          <TrashIcon width={22} height={22} />
          {loading && (
            <span className='absolute flex bg-slate-100/50 w-full h-full justify-center items-center rounded-full'>
              <IconSpinner />
            </span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side='bottom'>Delete Highlight</TooltipContent>
    </Tooltip>
  )
}
