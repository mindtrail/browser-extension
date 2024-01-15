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
    color: '',
    externalResources: [],
  },
  notes: [],
  pageData: '{ ...pageData }', // Only send it the first time... until the page was saved...?
  type: 'text', // or 'file'
  url: 'url',
}
