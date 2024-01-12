const payload = {
  content: 'clipping content',
  range: {
    startContainer: '#7821>textNode:nth-of-type(0)',
    startOffset: 0,
    startXPath: '/html/body/div[1]/div[2]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]',
    endContainer: '#7821>textNode:nth-of-type(0)',
    endOffset: 0,
    endXPath: '/html/body/div[1]/div[2]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]',
    commonAncestorContainer: '#7821',
    pageNumber: null,
    color: ''
  },
  notes: [],
  url: 'url',
  type: 'text', // or 'file'
  pageData: '{ ...pageData }', // Only send it the first time... until the page was saved...?
}

// Explore oss library too...

function getXPath(element) {
  let xpath = ''
  // Loop through the ancestors of the element until we reach the root
  while (element && element.nodeType === 1 && element.tagName.toLowerCase() !== 'body') {
    const siblings = Array.from(element.parentNode.children)

    // Find the index of the current element among its siblings, and add 1 to get a 1-based index
    let position = `[${siblings.indexOf(element)}]`
    xpath = '/' + element.tagName.toLowerCase() + position + xpath

    element = element.parentNode
  }
  return xpath
}
