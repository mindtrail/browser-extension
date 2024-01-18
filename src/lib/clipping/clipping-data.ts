import { start } from 'repl'
import { getPageData } from '~/lib/page-data'
import { getSelectionContent } from '~/lib/utils'

const IDENTIFIER_NESTED_LEVELS = 5
const XPATH_LEVELS = 999

const payload_format = {
  content: 'clipping content',
  selector: {},
  notes: [],
  pageData: '{ ...pageData }', // Only send it the first time... until the page was saved...?
  type: 'text', // or 'file'
  url: 'url',
  externalResources: [],
}

export const getClippingData = (range: Range) => {
  const {
    startContainer,
    startOffset,
    endContainer,
    endOffset,
    commonAncestorContainer,
  } = range

  const response = {
    content: range.toString(),
    color: '',
    externalResources: [],
    pageNumber: null,
    selector: {
      range: {
        startContainer: getContainerIdentifier(startContainer),
        startOffset,
        endContainer: getContainerIdentifier(endContainer),
        endOffset,
        commonAncestorContainer: getContainerIdentifier(
          commonAncestorContainer,
          XPATH_LEVELS,
        ),
        containerXpath: '',
      },
      // @TODO - add this as a fallback if the range indentifier fails.
      // There will be use cases where the range will fail
      // textPosition: {
      //   start: 0,
      //   end: 0,
      // },
      // @TODO - add this as a fallback if the prev two fail
      // surrounding: {
      //   before: '',
      //   after: '',
      // },
    },
  }

  return response
}

// From an DOM element, get a query to that DOM element
function getContainerIdentifier(
  node: ChildNode | Node,
  maxLevel = IDENTIFIER_NESTED_LEVELS,
  currentLevel = 0,
) {
  // If items are have IDs, use those, as they should be unique
  if ((node as Element)?.id) {
    return `#${escapeCSSString((node as Element).id)}`
  }

  if (node.nodeName === 'html') {
    return 'html'
  }

  if (currentLevel >= maxLevel) {
    return ''
  }

  const parent = node.parentNode
  const parentSelector = getContainerIdentifier(parent, maxLevel, currentLevel + 1)
  const nodeName = node.nodeType === Node.TEXT_NODE ? 'text' : node.nodeName.toLowerCase()

  const index = Array.from(parent.childNodes).indexOf(node as ChildNode)
  return `${parentSelector}/${nodeName}[${index}]`
}

// Colons and spaces are accepted in IDs in HTML but not in CSS syntax
// Similar (but much more simplified) to the CSS.escape() working draft
function escapeCSSString(cssString: string) {
  return cssString.replace(/(:)/gu, '\\$1')
}
