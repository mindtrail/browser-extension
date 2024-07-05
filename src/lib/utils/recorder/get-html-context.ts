const voidElements = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]

const attrConfig: any = {
  exclude: ['style', 'class', 'jslog', 'jsname', 'jsaction'],
  // include: ['role', 'name', 'alt', 'title', 'id', 'data-*'],
}

const ignoredTags = ['script', 'style', 'link', 'meta', 'svg', 'noscript', 'head', 'html']

const ignoreCheck = (element, tagName) => {
  if (
    ignoredTags.includes(tagName) ||
    (tagName === 'iframe' && element.children.length === 0)
  ) {
    return true
  }
  return false
}

const isUselessDiv = (element) => {
  return (
    ['div', 'span'].includes(element.tagName) &&
    Object.keys(element.attributes).length === 0
  )
}

const isEmpty = (element) => {
  return element.children.length === 0 && element.textContent.trim() === ''
}

const filterDOM = (element) => {
  const obj = {
    tagName: element.tagName.toLowerCase(),
    attributes: {},
    children: [],
  }
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i]
    if (attrConfig.exclude) {
      if (!attrConfig.exclude.includes(attr.name)) {
        obj.attributes[attr.name] = attr.value
      }
    } else {
      if (attrConfig.include.includes(attr.name)) {
        obj.attributes[attr.name] = attr.value
      }
    }
  }
  for (let i = 0; i < element.childNodes.length; i++) {
    const child = element.childNodes[i]
    if (child.nodeType === Node.ELEMENT_NODE) {
      const tagName = child.tagName.toLowerCase()
      if (ignoreCheck(child, tagName)) {
        continue
      }
      const childObj = filterDOM(child)
      if (isUselessDiv(childObj) || (isUselessDiv(childObj) && isEmpty(childObj))) {
        obj.children.push(...childObj.children)
      } else {
        obj.children.push(childObj)
      }
    } else if (child.nodeType === Node.TEXT_NODE) {
      const textContent = child.textContent.trim()
      if (textContent === '') {
        continue
      }
      obj.children.push({
        type: 'text',
        content: textContent,
        children: [],
      })
    }
  }
  return obj
}

const DOM2HTML = (bodyObject) => {
  const createElementString = (obj) => {
    if (obj.type === 'text') {
      return obj.content
    }
    const { tagName, attributes, children } = obj
    let attrs = ''
    for (const [key, value] of Object.entries(attributes)) {
      attrs += ` ${key}="${value}"`
    }
    const childrenHTML = children.map((child) => createElementString(child)).join('')
    if (voidElements.includes(tagName)) {
      return `<${tagName}${attrs}>`
    }
    return `<${tagName}${attrs}>${childrenHTML}</${tagName}>`
  }
  return createElementString(bodyObject)
}

export function getHtmlContext(element) {
  const dom = filterDOM(element)
  const html = DOM2HTML(dom)
  return html
}
