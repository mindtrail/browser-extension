import { useCallback, useEffect, useReducer, useState } from 'react'
import type { MouseEvent } from 'react'

import { useStorage } from '@plasmohq/storage/hook'
import { isSelectionExcludedNode, getClippingBtnPosition } from '~lib/utils'
import { MESSAGES, MIN_TEXT_FOR_CLIPPING } from '~/lib/constants'
import {
  addDeleteListener,
  removeDeleteListener,
  getClippingData,
  highlightClipping,
} from '~lib/clipping'

import { SaveClipping } from './save'

export const ClippingOverlay = () => {
  const [clippingList, setClippingList] = useStorage('clippingList', [])

  useEffect(() => {
    if (clippingList.length) {
      setTimeout(() => {
        highlightClipping(clippingList)
        // Add event listener only on the nodes that have the highlight class
        // addDeleteListener(clippingList)
      }, 500)
    }

    // return () => removeDeleteListener()
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
    </>
  )
}
