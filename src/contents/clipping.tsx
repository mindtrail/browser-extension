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
      console.log(newCoordinates)
      setBtnCoorindates(newCoordinates)
      // showClippingButton()
    }, 200)
  }, [])

  useEffect(() => {
    highlighter = new Highlighter({
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
        highlighter.stop()

        // sources = sources.map(hs => ({hs}));
        // save to backend
        // store.save(sources);
      })

    // auto-highlight selections
    highlighter.run()
    // document.addEventListener('click', handlePageClick)

    // // Return a cleanup function to remove the event listener
    // return () => {
    //   document.removeEventListener('click', handlePageClick)
    // }
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
        <ClipboardCopyIcon width={20} height={20} />
        {loading && (
          <span className='absolute flex bg-slate-100/50 w-full h-full justify-center items-center  text-slate-500'>
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

  if (!range) {
    return false
  }

  const { startContainer, endContainer, commonAncestorContainer, endOffset } = range
  const { bottom: rangeBottom, right: rangeRight } = range.getBoundingClientRect()

  // If the selection is within a single element, return the Range bounding rect
  if (startContainer === endContainer) {
    return getAdjustedCoordinates(rangeRight, rangeBottom)
  }

  // Make sure we have element nodes, not text nodes, to get bounding rects
  const endElement = getClosestElementNode(endContainer)

  const {
    top: endContainerTop,
    bottom: endContainerBottom,
    right: endContainerRight,
  } = endElement?.getBoundingClientRect() || {}

  // If I tripple click on a paragraph, or select over the end and a new line char is caught
  // The endContainer will be the NEXT paragraph or the CommonAcestor. Then return the Range
  if (
    (rangeBottom < endContainerTop && endOffset === 0) ||
    endContainer === commonAncestorContainer
  ) {
    return getAdjustedCoordinates(rangeRight, rangeBottom)
  }

  // Otherwise use endContainer - it will the end of the range, can be either anchor or focus
  return getAdjustedCoordinates(endContainerRight, endContainerBottom)
}

function getClosestElementNode(node: Node | null): Element | null {
  while (node && node.nodeType !== Node.ELEMENT_NODE) {
    node = node.parentNode
  }
  return node as Element | null
}

function getAdjustedCoordinates(XCoord: number, YCoord: number) {
  const maxRightPosition = document.documentElement.clientWidth * 0.85

  const isNearRightEdge = XCoord > maxRightPosition

  XCoord = isNearRightEdge ? maxRightPosition : XCoord + 16
  YCoord = isNearRightEdge ? YCoord + 4 : YCoord - 24

  return {
    left: XCoord + window.scrollX,
    top: YCoord + window.scrollY,
  }
}

// function getSelectionContent() {
//   const selection = window.getSelection()
//   if (selection.isCollapsed || !selection.rangeCount) {
//     return { text: '', images: [] }
//   }

//   const range = selection.getRangeAt(0)
//   const fragment = range.cloneContents()
//   const text = fragment.textContent

//   // Using a TreeWalker to retrieve images from the document fragment
//   const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_ELEMENT, {
//     acceptNode: (node) =>
//       node.nodeName.toLowerCase() === 'img'
//         ? NodeFilter.FILTER_ACCEPT
//         : NodeFilter.FILTER_REJECT,
//   })

//   const images = []
//   while (walker.nextNode()) {
//     // @ts-ignore
//     images.push(walker.currentNode.src) // Assuming you want the image source
//   }

//   return { text, images }
// }

// const selectedContent = getSelectionContent()
// console.log(selectedContent.text) // Logs the selected text
// console.log(selectedContent.images) // Logs the arr
