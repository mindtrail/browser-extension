import { HIGHLIGHT_CLASS, SPLIT_TEXTNODE_CLASS } from '~/lib/constants'

export function addDeleteListener(clippingList: SavedClipping[]) {
  // console.log(1111)
  const highlightedElements = document.querySelectorAll(`.${HIGHLIGHT_CLASS}`)
  highlightedElements.forEach((element) => {
    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)
  })
}

export function removeDeleteListener() {
  // console.log(23323)
  const highlightedElements = document.querySelectorAll(`.${HIGHLIGHT_CLASS}`)
  highlightedElements.forEach((element) => {
    element.removeEventListener('mouseenter', handleMouseEnter)
    element.removeEventListener('mouseleave', handleMouseLeave)
  })
}

const handleDelete = (event) => {
  console.log(444)
  // Your delete logic here
  console.log('Delete event triggered', event.target)
}

const handleMouseEnter = (event) => {
  // Set a timeout to show the delete button after 200ms
  const handler = setTimeout(() => {
    // Show delete button logic here
    console.log('Show delete button for', event.target)
    // You can use state to show the button, or directly manipulate the DOM
  }, 200)
  // setDelayHandler(handler);
}

const handleMouseLeave = () => {
  // If there's a pending timeout from mouseenter, clear it
  // if (delayHandler) {
  //   clearTimeout(delayHandler);
  //   setDelayHandler(null);
  // }
  // Hide delete button logic here
  console.log('Hide delete button')
  // Similarly, you can use state to hide the button, or directly manipulate the DOM
}
