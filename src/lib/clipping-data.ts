import { getPageData } from '~/lib/page-data'

export const getClippingData = (range: Range) => {
  const {
    startContainer,
    endContainer,
    commonAncestorContainer,
    startOffset,
    endOffset,
  } = range
}

const identifier = 'parent-identifier>child-identifier'
// Parent, Start & End Identifier:
// (parent)tagName + id + class  > (element)tagName + id + class:nth-of-type(x)

const payload = {
  content: 'clipping content',
  range: {
    startContainer: 'parent-identifier>child-identifiertextNode:nth-of-type(0)',
    startOffset: 10,
    endContainer: 'p-#7824>textNode[1]',
    endOffset: 22,
    commonAncestorContainer: '#7821',
    containerXpath: '/html/body/div[1]/div[2]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]',
    pageNumber: null,
    color: '',
    externalResources: [],
  },
  notes: [],
  pageData: '{ ...pageData }', // Only send it the first time... until the page was saved...?
  type: 'text', // or 'file'
  url: 'url',
}

var store = [
  [
    {
      url: '/reference/react/createContext',
      content: null,
      type: 'lvl1',
      hierarchy: {
        lvl0: 'React APIs',
        lvl1: 'createContext',
        lvl2: null,
        lvl3: null,
        lvl4: null,
        lvl5: null,
        lvl6: null,
      },
      objectID: '0-https://react.dev/reference/react/createContext',
      __docsearch_parent: false,
      __autocomplete_id: 3,
    },
  ],
]

// From an DOM element, get a query to that DOM element
function getQuery(element) {
  if (element.id) return `#${escapeCSSString(element.id)}`
  if (element.nodeName === 'html') return 'html'

  const parent = element.parentNode

  const parentSelector = getQuery(parent)
  // The element is a text node
  if (!element.nodeName) {
    // Find the index of the text node:
    const index = Array.prototype.indexOf.call(parent.childNodes, element)
    return `${parentSelector}>textNode:nth-of-type(${index})`
  } else {
    const index =
      Array.from(parent.childNodes)
        .filter((child) => child.nodeName === element.nodeName)
        .indexOf(element) + 1
    return `${parentSelector}>${element.nodeName}:nth-of-type(${index})`
  }
}

// Colons and spaces are accepted in IDs in HTML but not in CSS syntax
// Similar (but much more simplified) to the CSS.escape() working draft
function escapeCSSString(cssString) {
  return cssString.replace(/(:)/gu, '\\$1')
}
