import { useCallback, useEffect, useRef, useState } from 'react'

import { SaveClipping } from '~components/clipping/save-clipping'
import { DeleteClipping } from '~components/clipping/delete-clipping'

import { highlightClipping } from '~/lib/clipping/highlight'
import { removeHighlightClassAndAttr } from '~/lib/clipping/delete'
import { HIGHLIGHT_CLASS } from '~/lib/constants'
import { getBaseResourceURL } from '~/lib/utils'
import { useClippingsStorage } from '~/lib/hooks/storage'

const pageBaseURL = getBaseResourceURL(window.location.href)

export const ClippingOverlay = () => {
  const [clippingMap] = useClippingsStorage()
  const [clippingList, setClippingList] = useState<SavedClipping[]>([])

  // We only run this once. DOM can be altered.
  // That means Range & XPath will not be reliable for a second run to highlight.
  useEffect(() => {
    if (clippingMap && !clippingList?.length) {
      const clippingList = clippingMap[pageBaseURL] || []
      setClippingList(clippingList)

      // Highlight the clippings
      setTimeout(() => {
        highlightClipping(clippingList)
      }, 1500) // Tested with 6x slower CPU & this delay works then too
    }
  }, [clippingMap])

  const addClippingToList = useCallback(
    (newClipping: SavedClipping) => {
      // Add the new item individually
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

      console.log(clippingId)
      // Remove the highlight class from the removed elements
      removeHighlightClassAndAttr([...elementsToRemoveHighlight])
      setClippingList((prev) => prev.filter((c) => c?.id !== clippingId))
    },
    [setClippingList],
  )

  return (
    <>
      <SaveClipping addClippingToList={addClippingToList} />
      {clippingList?.length ? (
        <DeleteClipping clippingList={clippingList} onDelete={removeClippingFromList} />
      ) : null}
    </>
  )
}
