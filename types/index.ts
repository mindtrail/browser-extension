export {}

declare global {
  enum OverlayPosition {
    top = 'top',
    bottom = 'bottom',
    center = 'center',
  }

  type StorageData = {
    autoSave: boolean
    saveDelay: number
    excludeList: string[]
    overlayPosition?: OverlayPosition
  }
  interface ClippingRange {
    startContainer: string
    startOffset: number
    startXPath?: string
    endContainer: string
    endOffset: number
    endXPath?: string
    commonAncestorContainer: string
    pageNumber?: number
    color?: string
    externalResources?: []
  }

  interface Clipping {
    content: string
    range: ClippingRange
    notes?: []
    pageData: string
    type: string
    url: string
  }
}
