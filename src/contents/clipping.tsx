import styleText from 'data-text:~style.css'
import Brain from 'react:~/assets/brain.svg'
import manualModeIcon from 'url:~assets/manual-32.png'

import {
  useCallback,
  useEffect,
  useReducer,
  useState,
  type MouseEventHandler,
} from 'react'

import type { PlasmoCSConfig, PlasmoGetStyle } from 'plasmo'
import { useStorage } from '@plasmohq/storage/hook'

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

const ClippingOverlay = () => {
  const [loading, toggleLoading] = useReducer((c) => !c, false)
  const [overlayVisible, setOverlayVisible] = useState(false)

  const [settings, _setSettings] = useStorage(
    'settings',
    DEFAULT_EXTENSION_SETTINGS
  )

  const { excludeList } = settings
  const hostExcluded = isHostExcluded(excludeList)

  if (hostExcluded) {
    return null
  }

  const handlePageClick = useCallback((event: MouseEvent) => {
    setTimeout(() => {
      console.log(event.target)
      const selection = window.getSelection()
      selectedText = selection.toString().trim()

      console.log('selectedText', selectedText)
      if (
        selectedText.length < MIN_TEXT_FOR_CLIPPING ||
        isExcludedElement(event?.target)
      ) {
        setOverlayVisible(false)
        return
      }

      if (
        event.target === saveClippingBtn &&
        selectedText.length > MIN_TEXT_FOR_CLIPPING
      ) {
        // saveContent(selectedText);
        // then...
        // saveClippingBtn.style.display = 'none'
        // selection.empty()
        return
      }
      setOverlayVisible(true)
      showClippingButton()
    }, 200)
  }, [])

  useEffect(() => {
    document.addEventListener('click', handlePageClick)

    // Return a cleanup function to remove the event listener
    // when the component unmounts or rerenders
    return () => {
      document.removeEventListener('click', handlePageClick)
    }
  }, [])

  const handlePageSave = useCallback(
    async (event: MouseEventHandler<HTMLButtonElement>) => {
      // @ts-ignore
      event.stopPropagation()
      toggleLoading()
      const payload = getPageData(false)

      console.log('saving clipping...', payload)

      await chrome.runtime.sendMessage({
        message: MESSAGES.USER_TRIGGERED_SAVE,
        payload,
      })
      toggleLoading()
    },
    []
  )

  if (!overlayVisible) {
    return null
  }

  return (
    <TooltipProvider>
      <Button
        onClick={handlePageSave}
        disabled={loading}
        // variant=""
        className={`p-2 rounded-full h-auto absolute z-[999] transform`}>
        <Brain width={32} height={32} />
        {loading && (
          <span className="absolute flex bg-slate-100/50 w-full h-full justify-center items-center  text-slate-500">
            <IconSpinner />
          </span>
        )}
      </Button>
    </TooltipProvider>
  )
}

export default ClippingOverlay

function showClippingButton() {
  const selection = window.getSelection()

  if (!selection) {
    return
  }

  const isAlreadyVisible = saveClippingBtn.style.display !== 'none'
  const { XCoord, YCoord } = getButtonPosition(selection)

  // If the button was not visible initially, skip the transition
  if (!isAlreadyVisible) {
    saveClippingBtn.style.transform = 'none' // Reset translate values

    saveClippingBtn.style.left = XCoord + 'px'
    saveClippingBtn.style.top = YCoord + 'px'
  } else {
    const translateX = XCoord - saveClippingBtn.offsetLeft
    const translateY = YCoord - saveClippingBtn.offsetTop

    saveClippingBtn.style.transform = `translate(${translateX}px, ${translateY}px)`
  }

  saveClippingBtn.style.display = 'block'
}

// @TODO - proper check if it's not in a form element, or like in Mindtrail, it detect the div...
function isExcludedElement(element: EventTarget) {
  const excludedTagNames = ['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT']
  // @ts-ignore
  return excludedTagNames.includes(element?.tagName)
}

function getButtonPosition(selection: Selection) {
  const range = selection?.getRangeAt(0)

  if (!range) {
    return { XCoord: 0, YCoord: 0 }
  }

  const { startContainer, endContainer, commonAncestorContainer, endOffset } =
    range
  const { bottom: rangeBottom, right: rangeRight } =
    range.getBoundingClientRect()

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
    XCoord: XCoord + window.scrollX,
    YCoord: YCoord + window.scrollY,
  }
}

function savePageContent() {
  // Set flag to prevent further calls
  let contentSaved = true
  // Extract page data and send to background script or save directly
  const payload = getPageData()

  chrome.runtime.sendMessage({
    message: MESSAGES.AUTO_SAVE,
    payload,
  })
}
