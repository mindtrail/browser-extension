import styleText from 'data-text:~style.css'
import type { PlasmoCSConfig, PlasmoGetStyle } from 'plasmo'
import manualModeIcon from 'url:~assets/manual-32.png'

import { Storage } from '@plasmohq/storage'

import { MESSAGES } from '~/lib/constants'
import { getPageData } from '~/lib/page-data'

export const CONTENT_SCRIPT_MATCH = ['https://*/*', 'http://*/*']

export const CONTENT_SCRIPT_EXCLUDE = [
  'http://localhost:*/*',
  'https://*.google.com/*',
  'https://www.google.com/*',
  'https://*.slack.com/*',
  'https://*.zoom.us/*',
  'https://*.youtube.com/*',
  'https://*.openai.com/*',
  'https://*.github.com/*',
  'https://*.gmail.com/*',
  'https://*.plasmo.com/*',
  'https://*.docs.google.com/spreadsheets/*',
]

export const PLASMO_CONFIG: PlasmoCSConfig = {
  matches: CONTENT_SCRIPT_MATCH,
  exclude_matches: CONTENT_SCRIPT_EXCLUDE,
  world: 'MAIN',
}

// // Needed to inject the CSS into the page
export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement('style')
  style.textContent = styleText
  return style
}

const MIN_TEXT_LENGTH = 5
const storage = new Storage()

let saveClippingBtn: HTMLElement | null = null
let selectedText: string = ''

initClipping()

document.addEventListener('click', (event) => {
  // Deffered execution to allow the selectionchange event to complete
  setTimeout(() => {
    const selection = window.getSelection()
    selectedText = selection.toString().trim()

    if (
      selectedText.length < MIN_TEXT_LENGTH ||
      isExcludedElement(event?.target)
    ) {
      saveClippingBtn.style.display = 'none'
      return
    }

    if (
      event.target === saveClippingBtn &&
      selectedText.length > MIN_TEXT_LENGTH
    ) {
      // saveContent(selectedText);
      // then...
      // saveClippingBtn.style.display = 'none'
      // selection.empty()
      return
    }

    showClippingButton()
  }, 100)
})

async function initClipping() {
  const settings = (await storage.get('settings')) as StorageData

  if (!saveClippingBtn) {
    saveClippingBtn = document.createElement('img')

    // @ts-ignore
    saveClippingBtn.src = manualModeIcon // URL to your icon image
    saveClippingBtn.id = 'clipping-button'
    saveClippingBtn.style.position = 'absolute'
    saveClippingBtn.style.zIndex = '999'
    saveClippingBtn.style.width = '32px'
    saveClippingBtn.style.height = '32px'
    saveClippingBtn.style.cursor = 'pointer'
    document.body.appendChild(saveClippingBtn)
    saveClippingBtn.style.display = 'none'
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('Clipping initialized')
  }
}

function showClippingButton() {
  const selection = window.getSelection()

  if (!selection) {
    return
  }

  const isAlreadyVisible = saveClippingBtn.style.display !== 'none'
  const { leftPos, topPos } = getButtonPosition(selection)

  // If the button was not visible initially, skip the transition
  if (!isAlreadyVisible) {
    saveClippingBtn.style.transform = 'none' // Reset translate values

    saveClippingBtn.style.left = leftPos + 'px'
    saveClippingBtn.style.top = topPos + 'px'
  } else {
    const translateX = leftPos - saveClippingBtn.offsetLeft
    const translateY = topPos - saveClippingBtn.offsetTop

    saveClippingBtn.style.transform = `translate(${translateX}px, ${translateY}px)`
  }

  saveClippingBtn.style.display = 'block'
}

function isExcludedElement(element: EventTarget) {
  const excludedTagNames = ['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT']
  // @ts-ignore
  return excludedTagNames.includes(element?.tagName)
}

function getButtonPosition(selection: Selection) {
  const { scrollX, scrollY } = window
  const range = selection?.getRangeAt(0)

  if (!range) {
    return { leftPos: 0, topPos: 0 }
  }

  const { startContainer, endContainer } = range
  const { bottom: rangeBottom, right: rangeRight } =
    range.getBoundingClientRect()

  // If the selection is within a single element, return the Range bounding rect
  if (startContainer === endContainer) {
    return {
      leftPos: rangeRight + scrollX,
      topPos: rangeBottom + scrollY,
    }
  }

  // Make sure we have element nodes, not text nodes, to get bounding rects
  const startElement = getClosestElementNode(startContainer)
  const endElement = getClosestElementNode(endContainer)

  if (!startElement || !endElement) {
    return {
      leftPos: rangeRight + scrollX,
      topPos: rangeBottom + scrollY,
    }
  }

  // Selection may be top-down or bottom-up, so we'll return the rect of the bottom element
  const { right: startRight, bottom: startBottom } =
    startElement.getBoundingClientRect()
  const { right: endRight, bottom: endBottom } =
    endElement.getBoundingClientRect()

  let { width: docWidth } = document.documentElement.getBoundingClientRect()
  docWidth = docWidth * 0.8

  let leftPos = startBottom > endBottom ? startRight : endRight
  let topPos = startBottom > endBottom ? startBottom : endBottom

  leftPos = leftPos > docWidth ? docWidth : leftPos
  topPos = leftPos > docWidth ? topPos : topPos - 30

  return {
    leftPos: leftPos + scrollX,
    topPos: topPos + scrollY,
  }
}

function getClosestElementNode(node: Node | null): Element | null {
  while (node && node.nodeType !== Node.ELEMENT_NODE) {
    node = node.parentNode
  }
  return node as Element | null
}

function savePageContent() {
  // Set flag to prevent further calls
  let contentSaved = true
  // Extract page data and send to background script or save directly
  const payload = getPageData()

  console.log('Saving page content', payload)
  chrome.runtime.sendMessage({
    message: MESSAGES.AUTO_SAVE,
    payload,
  })
}
