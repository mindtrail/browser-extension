


function recursiveWrapper(container, highlightInfo) {
  return _recursiveWrapper(container, highlightInfo, false, 0)
}

function _recursiveWrapper(container, highlightInfo, startFound, charsHighlighted) {
  const {
    anchor,
    focus,
    anchorOffset,
    focusOffset,
    color,
    textColor,
    highlightIndex,
    selectionString,
  } = highlightInfo
  const selectionLength = selectionString.length

  // Get the child nodes of the container
  const childNodes = [...container.childNodes]

  childNodes.forEach((element) => {
    if (charsHighlighted >= selectionLength) return

    // Skip non-text nodes and invisible nodes
    if (element.nodeType !== Node.TEXT_NODE) {
      if (element.nodeType === Node.ELEMENT_NODE && element.offsetParent !== null) {
        let computedStyle = window.getComputedStyle(element)
        if (computedStyle.visibility !== 'hidden') {
          let result = _recursiveWrapper(
            element,
            highlightInfo,
            startFound,
            charsHighlighted,
          )
          startFound = result[0]
          charsHighlighted = result[1]
        }
      }
      return
    }

    // ... rest of the code remains the same ...
  })

  return [startFound, charsHighlighted]
}
