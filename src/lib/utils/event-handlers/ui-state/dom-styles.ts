// @TODO: Add an absolute position overlay with a high Z-Index
export function addOutlineStyles(element: HTMLElement) {
  if (!element || !element.style) return

  element.style.outline = '2px dashed green'
  element.style.outlineOffset = '1px'
  element.style.borderRadius = '4px'
  element.style.cursor = 'pointer'
  element.style.backgroundColor = 'rgba(0, 255, 0, 0.07)'
}

export function removeOutlineStyles(element: HTMLElement) {
  if (!element || !element.style) return

  element.style.outline = ''
  element.style.outlineOffset = ''
  element.style.borderRadius = ''
  element.style.cursor = ''
  element.style.backgroundColor = ''
}
