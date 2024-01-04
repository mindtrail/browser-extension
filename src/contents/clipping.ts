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

const MIN_TEXT_LENGTH = 4
const storage = new Storage()

let saveIcon: HTMLElement | null = null
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
      saveIcon.style.display = 'none'
      return
    }

    if (event.target === saveIcon && selectedText.length > MIN_TEXT_LENGTH) {
      // saveContent(selectedText);
      // then...
      // saveIcon.style.display = 'none'
      // selection.empty()
      return
    }

    showSaveIcon()
  }, 0)
})

async function initClipping() {
  const settings = (await storage.get('settings')) as StorageData

  if (!saveIcon) {
    saveIcon = document.createElement('img')

    // @ts-ignore
    saveIcon.src = manualModeIcon // URL to your icon image
    saveIcon.id = 'clipping-icon'
    saveIcon.style.position = 'absolute'
    saveIcon.style.zIndex = '999'
    saveIcon.style.width = '32px'
    saveIcon.style.height = '32px'
    saveIcon.style.cursor = 'pointer'
    document.body.appendChild(saveIcon)
    saveIcon.style.display = 'none'
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('Clipping initialized')
  }
}

function showSaveIcon() {
  const selection = window.getSelection()

  if (!selection) {
    return
  }

  // // if commonAncestorContainer is a text node, get its parent element
  // commonAncestorContainer =
  //   commonAncestorContainer.nodeType === Node.TEXT_NODE
  //     ? commonAncestorContainer.parentNode
  //     : commonAncestorContainer

  // @ts-ignore - Add highlightedContent class to the common ancestor container
  // commonAncestorContainer?.classList?.add('mindtrailClipping')

  // console.log(1111, selectedText)

  const { iconLeft, iconTop } = getButtonPos(selection)

  saveIcon.style.left = iconLeft + 'px'
  saveIcon.style.top = iconTop + 'px'
  saveIcon.style.display = 'block'
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

function isExcludedElement(element: EventTarget) {
  const excludedTagNames = ['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT']
  // @ts-ignore
  return excludedTagNames.includes(element?.tagName)
}

function getButtonPos(selection: Selection) {
  const docElement = document.documentElement
  const { width: docWidth } = docElement.getBoundingClientRect()

  const range = selection?.getRangeAt(0)
  const anchorNode = getAnchorNodeForOverlay(range)
  const { left, top, width, height } = anchorNode.getBoundingClientRect()

  const scrollLeft = window.scrollX || docElement.scrollLeft
  const scrollTop = window.scrollY || docElement.scrollTop

  const leftOffset = left + width < docWidth * 0.8 ? 10 : -50
  const topOffset = left + width < docWidth * 0.8 ? -30 : 0

  const iconLeft = left + width + scrollLeft + leftOffset
  const iconTop = top + height + scrollTop + topOffset

  return { iconLeft, iconTop }
}

function getAnchorNodeForOverlay(range: Range) {
  let { startContainer, endContainer } = range

  while (startContainer && startContainer.nodeType !== Node.ELEMENT_NODE) {
    startContainer = startContainer.parentNode
  }

  while (endContainer && endContainer.nodeType !== Node.ELEMENT_NODE) {
    endContainer = endContainer.parentNode
  }

  const startElement = startContainer as Element
  const endElement = endContainer as Element

  const startTop = startElement?.getBoundingClientRect().top
  const endTop = endElement?.getBoundingClientRect().top

  console.log(startTop, endTop)
  return startTop < endTop ? endElement : startElement
}
