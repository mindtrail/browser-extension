import { useCallback, useEffect, useReducer, useState, type MouseEvent } from 'react'
import { useStorage } from '@plasmohq/storage/hook'
import { ClipboardCopyIcon } from '@radix-ui/react-icons'

import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'

import { IconSpinner } from '~/components/icon-spinner'
import { Button } from '~/components/ui/button'

import { getClippingData } from '~/lib/clipping/clipping-data'
import {
  isHostExcluded,
  isSelectionExcludedNode,
  getClippingBtnPosition,
} from '~lib/utils'
import {
  MESSAGES,
  MIN_TEXT_FOR_CLIPPING,
  DEFAULT_EXTENSION_SETTINGS,
} from '~/lib/constants'

export const ClippingOverlay = () => {
  const [loading, toggleLoading] = useReducer((c) => !c, false)
  const [btnCoorindates, setBtnCoorindates] = useState(null)

  const [settings, _setSettings] = useStorage('settings', DEFAULT_EXTENSION_SETTINGS)
  const [clippingList, setClippingList] = useStorage('clippingList', [])
  // console.log('Clipping List', clippingList)

  const { excludeList } = settings
  const hostExcluded = isHostExcluded(excludeList)

  if (hostExcluded) {
    return null
  }

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

    selection?.empty()

    setBtnCoorindates(null)
  }, [])

  if (!btnCoorindates) {
    return null
  }

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
      <TooltipContent>Save Selection</TooltipContent>
    </Tooltip>
  )
}
