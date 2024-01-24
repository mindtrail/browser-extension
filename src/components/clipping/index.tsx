import { useCallback, useEffect } from 'react'
import { useStorage } from '@plasmohq/storage/hook'

import { highlightClipping } from '~lib/clipping'

import { SaveClipping } from '~/components/clipping/save'
import { DeleteClipping } from '~/components/clipping/delete'

export const ClippingOverlay = () => {
  const [clippingList, setClippingList] = useStorage('clippingList', [])

  // @TODO: Filter clipping list by page url
  useEffect(() => {
    if (clippingList.length) {
      setTimeout(() => {
        highlightClipping(clippingList)
      }, 1500) // For really slow computers, this may need to be even higher
    }
  }, [clippingList])

  const addClippingToList = useCallback(
    (newClipping: SavedClipping) => {
      setClippingList((prev) => [...prev, newClipping])
    },
    [setClippingList]
  )
  return (
    <>
      <SaveClipping addClippingToList={addClippingToList} />
      {clippingList?.length && <DeleteClipping clippingList={clippingList} />}
    </>
  )
}
