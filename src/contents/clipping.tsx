import styleText from 'data-text:~style.css'
import Highlighter from 'web-highlighter'

import { useCallback, useEffect, useReducer, useState } from 'react'
import type { PlasmoCSConfig, PlasmoGetStyle } from 'plasmo'
import { useStorage } from '@plasmohq/storage/hook'
import { ClipboardCopyIcon } from '@radix-ui/react-icons'

import { TooltipProvider } from '~/components/ui/tooltip'
import { IconSpinner } from '~/components/icon-spinner'
import { Button } from '~/components/ui/button'

import { getPageData } from '~/lib/page-data'
import { isHostExcluded } from '~lib/utils'
import {
  MESSAGES,
  MIN_TEXT_FOR_CLIPPING,
  DEFAULT_EXTENSION_SETTINGS,
} from '~/lib/constants'

// export const PLASMO_CONFIG: PlasmoCSConfig = {
// world: 'MAIN',
// }

// // Needed to inject the CSS into the page
export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement('style')
  style.textContent = styleText
  return style
}

let saveClippingBtn: HTMLElement | null = null
let selectedText: string = ''
let highlighter: Highlighter | null = null

const ClippingOverlay = () => {
  const [loading, toggleLoading] = useReducer((c) => !c, false)
  const [btnCoorindates, setBtnCoorindates] = useState(null)

  const [settings, _setSettings] = useStorage('settings', DEFAULT_EXTENSION_SETTINGS)

  const { excludeList } = settings
  const hostExcluded = isHostExcluded(excludeList)

  if (hostExcluded) {
    return null
  }

  const handlePageClick = useCallback((event: MouseEvent) => {
    setTimeout(() => {
      const selection = window.getSelection()
      const selectedText = selection.toString().trim()

      console.log('selectedText', selectedText)
      if (
        selectedText.length < MIN_TEXT_FOR_CLIPPING ||
        isExcludedElement(event?.target)
      ) {
        setBtnCoorindates(null)
        return
      }

      const newCoordinates = getButtonPosition(selection)
      if (!newCoordinates) {
        return
      }

      console.log(newCoordinates)
      setBtnCoorindates(newCoordinates)
      // showClippingButton()
    }, 100)
  }, [])

  useEffect(() => {
    highlighter = new Highlighter({
      exceptSelectors: ['button', 'input', 'textarea', 'select'],
      style: { className: 'mindtrailClipping' },
    })

    highlighter
      .on('selection:hover', ({ id }) => {
        console.log(1234, id)
        // display different bg color when hover
        highlighter.addClass('highlight-wrap-hover', id)
      })
      .on('selection:hover-out', ({ id }) => {
        // remove the hover effect when leaving
        highlighter.removeClass('highlight-wrap-hover', id)
      })
      .on('selection:create', ({ sources }) => {
        console.log(sources)
        // highlighter.stop()

        // sources = sources.map(hs => ({hs}));
        // save to backend
        // store.save(sources);
      })

    // auto-highlight selections
    document.addEventListener('click', handlePageClick)

    // // Return a cleanup function to remove the event listener
    return () => {
      document.removeEventListener('click', handlePageClick)
      highlighter.dispose()
    }
  }, [])

  const handleClippingSave = useCallback(async () => {
    // @ts-ignore
    const selection = window.getSelection()
    selectedText = selection.toString().trim()

    if (selectedText.length < MIN_TEXT_FOR_CLIPPING) {
      return
    }

    toggleLoading()
    const payload = getPageData(false)

    payload.html = selectedText

    console.log('saving clipping...', selectedText)

    // await chrome.runtime.sendMessage({
    //   message: MESSAGES.USER_TRIGGERED_SAVE,
    //   payload,
    // })
    toggleLoading()
    setBtnCoorindates(null)
  }, [])

  if (!btnCoorindates) {
    return null
  }

  const { left, top } = btnCoorindates

  return (
    <TooltipProvider>
      <Button
        onClick={(event) => {
          event.stopPropagation()
          handleClippingSave()
        }}
        disabled={loading}
        variant='outline'
        style={{ transform: `translate(${left}px, ${top}px)` }}
        className={`p-1 rounded-full h-auto absolute z-[999]
          bg-white hover:bg-slate-200 text-accent-foreground/75
          transform transition-transform duration-200 ease-out `}
      >
        <ClipboardCopyIcon width={22} height={22} />
        {loading && (
          <span className='absolute flex bg-slate-100/50 w-full h-full justify-center items-center'>
            <IconSpinner />
          </span>
        )}
      </Button>
    </TooltipProvider>
  )
}

export default ClippingOverlay

// @TODO - proper check if it's not in a form element, or like in Mindtrail, it detect the div...
function isExcludedElement(element: EventTarget) {
  const excludedTagNames = ['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT']
  // @ts-ignore
  return excludedTagNames.includes(element?.tagName)
}

function getButtonPosition(selection: Selection) {
  const range = selection?.getRangeAt(0)

  const { bottom, left, width } = range.getBoundingClientRect()
  const XCoord = left + width / 2 - 16 // half of button width

  return {
    left: XCoord + window.scrollX,
    top: bottom + window.scrollY + 24,
  }
}

// const selectedContent = getSelectionContent()
// console.log(selectedContent.text) // Logs the selected text
// console.log(selectedContent.images) // Logs the arr
