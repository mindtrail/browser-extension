import { useCallback, useEffect, useRef } from 'react'
import { useStorage } from '@plasmohq/storage/hook'

import { SaveClipping } from '~/components/clipping/save'
import { DeleteClipping } from '~/components/clipping/delete'

import { highlightClipping } from '~/lib/clipping/highlight'
import { removeHighlightClass } from '~/lib/clipping/delete'
import { HIGHLIGHT_CLASS } from '~/lib/constants'

export const ClippingOverlay = () => {
  const [clippingList, setClippingList] = useStorage('clippingList', [])
  const highlightInitialized = useRef(false) // Ref to track if highlighting has been initialized

  // @TODO: Filter clipping list by page url
  // We only run this once, since the DOM can be altered, so then the XPath will not be reliable
  useEffect(() => {
    if (clippingList?.length && !highlightInitialized.current) {
      setTimeout(() => {
        highlightClipping(clippingList)
        highlightInitialized.current = true // Mark as initialized
      }, 1500) // Adjust the delay as needed
    }
  }, [clippingList])

  const addClippingToList = useCallback(
    (newClipping: SavedClipping) => {
      highlightClipping([newClipping])
      setClippingList((prev) => [...prev, newClipping])
    },
    [setClippingList],
  )

  const removeClippingFromList = useCallback(
    (clippingId: string) => {
      const elementsToRemoveHighlight = document.querySelectorAll(
        `.${HIGHLIGHT_CLASS}[data-highlight-id="${clippingId}"]`,
      )

      // Remove the highlight class from the removed elements
      removeHighlightClass([...elementsToRemoveHighlight])
      setClippingList((prev) => prev.filter((c) => c.id !== clippingId))
    },
    [setClippingList],
  )

  return (
    <>
      <SaveClipping addClippingToList={addClippingToList} />
      {clippingList?.length && (
        <DeleteClipping clippingList={clippingList} onDelete={removeClippingFromList} />
      )}
    </>
  )
}
