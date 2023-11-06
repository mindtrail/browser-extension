export {}

declare global {
  type StorageData = {
    autoSave: boolean
    saveDelay: number
    excludeList: string[]
  }
}
