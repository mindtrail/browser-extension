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

const MIN_TEXT_LENGTH = 20
const storage = new Storage()

let saveIcon: HTMLElement | null = null
let iconTimer: NodeJS.Timeout
let selectedText: string = ''

// addEventListener version
document.addEventListener('selectionchange', () => {
  selectedText = document.getSelection().toString().trim()
})

document.addEventListener('mouseup', function (event: MouseEvent) {
  if (isExcludedElement(event?.target)) {
    return
  }

  // Clear any previous timer
  clearTimeout(iconTimer)

  // Set a timer to show the icon after a short delay,
  // otherwise onClick will be called immediately after and hide the icon
  iconTimer = setTimeout(() => showSaveIcon(event), 100) // 100ms delay
})

function showSaveIcon(event: MouseEvent) {
  const selection = window.getSelection()
  let commonAncestorContainer = selection?.getRangeAt(0).commonAncestorContainer

  // if commonAncestorContainer is a text node, get its parent element
  commonAncestorContainer =
    commonAncestorContainer.nodeType === 3
      ? commonAncestorContainer.parentNode
      : commonAncestorContainer

  // @ts-ignore - Add highlightedContent class to the common ancestor container
  commonAncestorContainer?.classList?.add('highlightedContent')

  selectedText = selection.toString().trim()

  console.log(1111, selectedText)

  if (selectedText.length > MIN_TEXT_LENGTH) {
    saveIcon.style.left = event.clientX + 'px'
    saveIcon.style.top = event.clientY + 'px'
    saveIcon.style.display = 'block'
  }
}

// Hide the save icon when clicking elsewhere
document.addEventListener('click', function (event) {
  console.log('Clicked')

  if (event.target === saveIcon && selectedText.length > MIN_TEXT_LENGTH) {
    console.log('Saving content', selectedText)
    // window.getSelection()
    // Code to handle the saving of content
    // saveContent(selectedText);
  }

  saveIcon.style.display = 'none'
})

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

async function initClippingListener() {
  const settings = (await storage.get('settings')) as StorageData

  if (!saveIcon) {
    saveIcon = document.createElement('img')

    // @ts-ignore
    saveIcon.src = manualModeIcon // URL to your icon image
    saveIcon.id = 'clipping-icon'
    saveIcon.style.position = 'absolute'
    saveIcon.style.cursor = 'pointer'
    document.body.appendChild(saveIcon)
    saveIcon.style.display = 'none'
  }

  console.log('Clipping listener initialized', saveIcon)
}

function isExcludedElement(element: EventTarget) {
  const excludedTagNames = ['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT']
  // @ts-ignore
  return excludedTagNames.includes(element?.tagName)
}

initClippingListener()
