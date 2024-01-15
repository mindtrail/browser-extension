import styleText from 'data-text:~style.css'
import Highlighter from 'web-highlighter'

import { useCallback, useEffect, useReducer, useState, type MouseEvent } from 'react'
import type { PlasmoGetStyle } from 'plasmo'
import { useStorage } from '@plasmohq/storage/hook'
import { ClipboardCopyIcon } from '@radix-ui/react-icons'

import { TooltipProvider } from '~/components/ui/tooltip'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { IconSpinner } from '~/components/icon-spinner'
import { Button } from '~/components/ui/button'

import { getPageData } from '~/lib/page-data'
import { isHostExcluded } from '~lib/utils'
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

var store: HighlightSource[] = [
  {
    startMeta: { parentTagName: 'P', parentIndex: 8, textOffset: 0 },
    endMeta: { parentTagName: 'P', parentIndex: 9, textOffset: 336 },
    text: "It's from an idea: highlight texts on the website and save the highlighted areas just like what you do in PDF.\nIf you have ever visited medium.com, you must know the feature of highlighting notes: users select a text segment and click the 'highlight' button. Then the text will be highlighted with a shining background color. Besides, the highlighted areas will be saved and recovered when you visit it next time. It's like the simple demo bellow.",
    id: '5c5e1c11-5684-4d74-b1d4-7b8466d08100',
  },
  {
    startMeta: { parentTagName: 'P', parentIndex: 11, textOffset: 0 },
    endMeta: { parentTagName: 'H2', parentIndex: 8, textOffset: 7 },
    text: "This is a useful feature for readers. If you're a developer, you may want your website support it and attract more visits. If you're a user (like me), you may want a browser-plugin to do this.\nFor this reason, the repo (web-highlighter) aims to help you implement highlighting-note on any website quickly (e.g. blogs, document viewers, online books and so on). It contains the core abilities for note highlighting and persistence. And you can implement your own product by some easy-to-use APIs. It has been used for our sites in production.\nInstall",
    id: 'e0683d18-60aa-4731-b42c-fd1e4d167bfc',
  },
  {
    startMeta: { parentTagName: 'SPAN', parentIndex: 422, textOffset: 0 },
    endMeta: { parentTagName: 'PRE', parentIndex: 3, textOffset: 160 },
    text: "import Highlighter from 'web-highlighter';\n\n// won't highlight pre&code elements\nconst highlighter = new Highlighter({\n    exceptSelectors: ['pre', 'code']\n});\n",
    id: 'b6bd2f07-ad99-4afb-9e55-12d3adcef59c',
  },
  {
    startMeta: { parentTagName: 'P', parentIndex: 16, textOffset: 0 },
    endMeta: { parentTagName: 'PRE', parentIndex: 4, textOffset: 5 },
    text: 'Besides, there is an example in this repo (in example folder). To play with it, you just need ——\nFirstly enter the repository and run\nnpm i',
    id: '320fe0a9-85a0-4bd2-8722-9660b3bd30f3',
  },
]

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

  useEffect(() => {
    highlighter = new Highlighter({
      exceptSelectors: ['button', 'input', 'textarea', 'select'],
      style: { className: 'mindtrailClipping' },
    })

    const { CREATE, HOVER, HOVER_OUT, CLICK } = Highlighter.event

    highlighter
      .on(HOVER, ({ id }) => {
        // console.log(1234, id)
        // display different bg color when hover
        // highlighter.addClass('highlight-wrap-hover', id)
      })
      .on(CLICK, ({ id }) => {
        console.log(1234, id)
        // remove the hover effect when leaving
        highlighter.removeClass('highlight-wrap-hover', id)
      })
      .on(CREATE, ({ sources }) => {
        console.log(sources)
        // handlePageClick(new MouseEvent('click'))
        // highlighter.stop()

        const pageData = getPageData(false)
        // console.log('saving clipping...', pageData)

        // await chrome.runtime.sendMessage({
        //   message: MESSAGES.USER_TRIGGERED_SAVE,
        //   payload,
        // })

        // sources = sources.map(hs => ({hs}));
        // save to backend
        // store.save(sources);

        // store.push(sources)
        console.log(JSON.stringify(store))
        toggleLoading()

        toggleLoading()
        setBtnCoorindates(null)
      })

    window.onload = () => {
      store.forEach(({ startMeta, endMeta, id, text }) => {
        // highlighter.fromStore(startMeta, endMeta, id, text)
      })
    }

    document.addEventListener('click', handlePageClick)
    // Return a cleanup function to remove the event listener
    return () => {
      document.removeEventListener('click', handlePageClick)
      highlighter.dispose()
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

      const newCoordinates = getButtonPosition(range)
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
    highlighter.fromRange(range)
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

// @TODO - proper check if it's not in a form element, or like in Mindtrail, it detect the div...
function isExcludedElement(range: Range) {
  const element = range.commonAncestorContainer as HTMLElement

  const excludedTagNames = ['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT']

  if (element.contentEditable === 'true') {
    return true
  }

  return excludedTagNames.includes(element?.tagName)
}

function getButtonPosition(range: Range) {
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
