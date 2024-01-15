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

  interface DomMeta {
    parentTagName: string
    parentIndex: number
    textOffset: number
    extra?: unknown
  }
  interface HighlightSource {
    startMeta: DomMeta
    endMeta: DomMeta
    text: string
    id: string
    extra?: unknown
  }
}
