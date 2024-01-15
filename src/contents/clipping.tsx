import styleText from 'data-text:~style.css'

import { useCallback, useEffect, useReducer, useState, type MouseEvent } from 'react'
import type { PlasmoGetStyle } from 'plasmo'
import { useStorage } from '@plasmohq/storage/hook'
import { ClipboardCopyIcon } from '@radix-ui/react-icons'

import { TooltipProvider } from '~/components/ui/tooltip'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { IconSpinner } from '~/components/icon-spinner'
import { Button } from '~/components/ui/button'

import { getPageData } from '~/lib/page-data'
import { isHostExcluded, isExcludedElement, getClippingBtnPosition } from '~lib/utils'
import {
  MESSAGES,
  MIN_TEXT_FOR_CLIPPING,
  DEFAULT_EXTENSION_SETTINGS,
} from '~/lib/constants'

// // Needed to inject the CSS into the page
export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement('style')
  style.textContent = styleText
  return style
}

var store = [
  {
    uid: '1e6ebbd2-0557-4902-9e7f-2c41aad74205',
    textBefore:
      'e.jsonadd iframetsconfig.gen-dts.jsonmigrate to typescriptView all filesRepository files navigationREADMEMIT licenseweb-marker\n\n',
    text: 'A web page highlighter that features\n\naccurate serialization and deserialization which makes it possible to correctly restore the highlights, even if part of the web page has changed\nnested highlighting\nno runtime-dependency',
    textAfter:
      '\n\n\nHow to run\ngit clone https://github.com/notelix/web-marker\ncd web-marker\nnpm i\nnpm start\n    \n      \n    \n\n      \n    \n  \nHow',
  },
]

const ClippingOverlay = () => {
  const [loading, toggleLoading] = useReducer((c) => !c, false)
  const [btnCoorindates, setBtnCoorindates] = useState(null)

  const [settings, _setSettings] = useStorage('settings', DEFAULT_EXTENSION_SETTINGS)

  const { excludeList } = settings
  const hostExcluded = isHostExcluded(excludeList)

  if (hostExcluded) {
    return null
  }

  useEffect(() => {
    // const pageData = getPageData(false)
    // console.log('saving clipping...', pageData)
    // await chrome.runtime.sendMessage({
    //   message: MESSAGES.USER_TRIGGERED_SAVE,
    //   payload,
    // })

    // toggleLoading()

    // toggleLoading()
    // setBtnCoorindates(null)

    window.onload = () => {
      // store.forEach(({ startMeta, endMeta, id, text }) => {
      // highlighter.fromStore(startMeta, endMeta, id, text)
      // })
    }

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
      if (selectedText.length < MIN_TEXT_FOR_CLIPPING || isExcludedElement(range)) {
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

  const handleClippingSave = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    const selection = window.getSelection()
    const selectedText = selection?.toString()?.trim()

    if (selectedText?.length < MIN_TEXT_FOR_CLIPPING) {
      return
    }
    const range = selection?.getRangeAt(0)
    console.log(range)

    // fromRange... highlighter create
  }, [])

  if (!btnCoorindates) {
    return null
  }

  const { left, top } = btnCoorindates

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleClippingSave}
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
        </TooltipTrigger>
        <TooltipContent>Save Selection</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default ClippingOverlay
