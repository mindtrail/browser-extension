import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import type { MouseEvent } from 'react'

import { TrashIcon } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { Button } from '~/components/ui/button'

import { IconSpinner } from '~/components/icon-spinner'

import { MESSAGES, HIGHLIGHT_CLASS } from '~/lib/constants'
import { getDeleteBtnCoordinates } from '~/lib/clipping/delete'

interface DeleteClippingProps {
  clippingList: SavedClipping[]
  onDelete: (id: string) => void
}

const MAX_RETRIES = 8

export const DeleteClipping = ({ clippingList, onDelete }: DeleteClippingProps) => {
  const [loading, toggleLoading] = useReducer((c) => !c, false)
  const [btnCoorindates, setBtnCoorindates] = useState(null)
  const [listenerRetryNr, setListenerRetryNr] = useState(0)
  const [hoveredClippingId, setHoveredClippingId] = useState<string | null>(null)
  const hideTimeout = useRef(null) // useRef to persist hideTimeout between renders

  useEffect(() => {
    if (listenerRetryNr >= MAX_RETRIES) {
      return
    }
    // This operation needs to happen after the highlights were added to the DOM - 1.5s
    // A 2s timeout for example is too big, because on delete, we need to wait 2s for the interaction.
    // A retry every half a second should work: 3rd try for all items, & 550ms for delete
    setTimeout(() => {
      addDeleteListener(clippingList)
    }, 550)
    return () => removeDeleteListener()
  }, [clippingList, listenerRetryNr])

  const handleHighlightMouseEnter = useCallback((event: Event) => {
    const target = event.target as HTMLElement
    const clippingId = target?.dataset?.highlightId

    if (!clippingId) {
      return
    }

    const allHighlightElements = document.querySelectorAll(
      `.${HIGHLIGHT_CLASS}[data-highlight-id="${clippingId}"]`
    )

    const btnCoordinates = getDeleteBtnCoordinates([...allHighlightElements])
    clearTimeout(hideTimeout.current)
    setBtnCoorindates(btnCoordinates)
    setHoveredClippingId(clippingId)
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (loading) {
      return
    }

    hideTimeout.current = setTimeout(() => {
      setBtnCoorindates(null)
      setHoveredClippingId(null)
    }, 400)
  }, [])

  const handleBtnMouseEnter = useCallback(() => {
    console.log(hoveredClippingId)

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
      element.addEventListener('mouseenter', handleHighlightMouseEnter)
      element.addEventListener('mouseleave', handleMouseLeave)
    }
  }

  function removeDeleteListener() {
    const highlightedElements = document.getElementsByClassName(HIGHLIGHT_CLASS)

    for (const element of highlightedElements) {
      element.removeEventListener('mouseenter', handleHighlightMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }

  const handleDelete = useCallback(
    async (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()

      console.log(hoveredClippingId)
      toggleLoading()
      const payload = { clippingId: hoveredClippingId }

      const response = await chrome.runtime.sendMessage({
        message: MESSAGES.DELETE_CLIPPING,
        payload,
      })

      toggleLoading()
      if (response?.error) {
        const { message, status } = response.error
        alert(`${status}: ${message}`) // TODO: use toast (status message)

        console.error(`${status}: ${message}`)
        return
      }

      setBtnCoorindates(null)
      setHoveredClippingId(null)
      onDelete(hoveredClippingId)
    },
    [hoveredClippingId]
  )

  if (!btnCoorindates) {
    return null
  }

  const { left, top } = btnCoorindates

  console.log(hoveredClippingId)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={handleDelete}
          onMouseEnter={handleBtnMouseEnter}
          onMouseLeave={handleMouseLeave}
          disabled={loading}
          variant='destructive'
          style={{ transform: `translate(${left}px, ${top}px)` }}
          className={`p-1 rounded-full h-auto absolute z-[999]
            bg-white hover:bg-slate-200 text-danger/75
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
      <TooltipContent side='bottom' sideOffset={8}>
        Delete Highlight
      </TooltipContent>
    </Tooltip>
  )
}
