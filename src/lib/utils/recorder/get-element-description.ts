// This is used to generate event_description for the "manual generated events" and this is essential for linking the manual generating events with ai generated actions when "merging" them
// This function will return the closest text content for the given element. Most of the times that will be the "label" of the element
export function getElementDescription(element) {
  // Helper function to check if a node has text content
  function hasTextContent(node) {
    return node.textContent.trim().length > 0
  }

  // Check if the element itself has text content
  if (hasTextContent(element)) {
    return { element, text: element.textContent.trim() }
  }

  // Define the traversal strategy
  const traversalQueue = [element]
  while (traversalQueue.length > 0) {
    const currentNode = traversalQueue.shift()

    // Check siblings first
    let sibling = currentNode.previousSibling
    while (sibling) {
      if (sibling.nodeType === Node.ELEMENT_NODE && hasTextContent(sibling)) {
        return { element: sibling, text: sibling.textContent.trim() }
      }
      sibling = sibling.previousSibling
    }

    sibling = currentNode.nextSibling
    while (sibling) {
      if (sibling.nodeType === Node.ELEMENT_NODE && hasTextContent(sibling)) {
        return { element: sibling, text: sibling.textContent.trim() }
      }
      sibling = sibling.nextSibling
    }

    // Then check parent
    const parentNode = currentNode.parentNode
    if (
      parentNode &&
      parentNode.nodeType === Node.ELEMENT_NODE &&
      hasTextContent(parentNode)
    ) {
      return { element: parentNode, text: parentNode.textContent.trim() }
    }

    // Add parent to the queue to continue the search
    if (parentNode) {
      traversalQueue.push(parentNode)
    }
  }

  return { element: null, text: '' }
}
