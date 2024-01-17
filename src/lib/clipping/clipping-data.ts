import { getPageData } from '~/lib/page-data'
import { getSelectionContent } from '~/lib/utils'

export const getClippingData = (range: Range) => {
  const {
    startContainer,
    startOffset,
    endContainer,
    endOffset,
    commonAncestorContainer,
  } = range

  var selector = {
    startContainer: getContainerIdentifier(startContainer),
    startOffset,
    endContainer: getContainerIdentifier(endContainer),
    endOffset,
    commonAncestorContainer: getContainerIdentifier(commonAncestorContainer),
  }
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
        commonAncestorContainer: getContainerIdentifier(commonAncestorContainer),
        containerXpath: getXPath(commonAncestorContainer),
      },
    },
  }

  console.log(selector)

  return response
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
function getContainerIdentifier(node: ChildNode | Node) {
  // If items are have IDs, use those, as they should be unique
  if ((node as Element)?.id) {
    return `#${escapeCSSString((node as Element).id)}`
  }
  if (node.nodeName === 'html') {
    return 'html'
  }

  const parent = node.parentNode
  const parentSelector = getContainerIdentifier(parent)

  if (node.nodeType === Node.TEXT_NODE) {
    const index = Array.prototype.indexOf.call(parent.childNodes, node)
    return `${parentSelector}/textNode[${index}]`
  }

  const index = Array.from(parent.childNodes)
    .filter((child) => child.nodeName === node.nodeName)
    .indexOf(node as ChildNode)
  return `${parentSelector}/${node.nodeName.toLowerCase()}[${index}]`
}

// Colons and spaces are accepted in IDs in HTML but not in CSS syntax
// Similar (but much more simplified) to the CSS.escape() working draft
function escapeCSSString(cssString) {
  return cssString.replace(/(:)/gu, '\\$1')
}

export function getXPath(node: ChildNode | Node) {
  let xpath = ''
  // Loop through the ancestors of the node until we reach the root
  while (
    (node?.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE) &&
    node?.nodeName !== 'HTML'
  ) {
    const siblings = Array.from(node.parentNode.childNodes).filter(
      (n) => n.nodeName === node.nodeName,
    )

    // Find the index of the current node among its siblings, and add 1 to get a 1-based index
    let position = `[${siblings.indexOf(node as ChildNode)}]`
    xpath = '/' + node.nodeName.toLowerCase() + position + xpath

    node = node.parentNode
  }
  return xpath
}
