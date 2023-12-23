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
}
