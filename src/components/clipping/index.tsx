import { useCallback, useEffect, useRef, useState } from 'react'
import { Storage } from '@plasmohq/storage'
import { useStorage } from '@plasmohq/storage/hook'

import { SaveClipping } from '~components/clipping/save-clipping'
import { DeleteClipping } from '~components/clipping/delete-clipping'

import { highlightClipping } from '~/lib/clipping/highlight'
import { removeHighlightClassAndAttr } from '~/lib/clipping/delete'
import { HIGHLIGHT_CLASS, STORAGE_KEY } from '~/lib/constants'
import { getBaseResourceURL } from '~/lib/utils'

const STORAGE_CLIPPINGS = {
  key: STORAGE_KEY.CLIPPINGS_BY_DS,
  instance: new Storage({ area: 'local' }), // Use localStorage instead of sync
}
const pageBaseURL = getBaseResourceURL(window.location.href)

export const ClippingOverlay = () => {
  const [clippingMap] = useStorage(STORAGE_CLIPPINGS)
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
      }, 1500) // Adjust the delay as needed
    }
  }, [clippingMap])

  const addClippingToList = useCallback(
    (newClipping: SavedClipping) => {
      console.log('aadddddd :::', newClipping)

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

      console.log(2222, clippingId)
      // Remove the highlight class from the removed elements
      removeHighlightClassAndAttr([...elementsToRemoveHighlight])
      setClippingList((prev) => prev.filter((c) => c.id !== clippingId))
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
