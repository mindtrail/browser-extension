export {}

declare global {
  enum OverlayPosition {
    top = 'top',
    bottom = 'bottom',
    center = 'center',
  }

  type SettingsStored = {
    autoSave: boolean
    saveDelay: number
    excludeList: string[]
    overlayPosition?: OverlayPosition
    isSidebarOpen?: boolean
    activeTab?: string
  }

  interface ClippingRange {
    startContainer: string
    startOffset: number
    endContainer: string
    endOffset: number
    commonAncestorContainer: string
  }

  interface SurroundingText {
    before: string
    after: string
  }

  interface TextPosition {
    start: number
    end: number
  }

  interface SavedClipping {
    id?: string
    content: string
    pageData?: PageData
    dataSource?: DataSource
    selector: {
      range: ClippingRange
      surroundingText: SurroundingText
      textPosition: TextPosition
      color?: string
      externalResources?: []
      pageNumber?: number
    }
    notes?: []
    type?: string
  }

  interface ClippingByDataSource {
    dataSourceName: string
    clippingList: SavedClipping[]
  }

  type WEB_Data = {
    title: string
    description: string
    image?: string
    url: string
    tags?: string[]
  }

  type PageData = WEB_Data & {
    autoSave?: boolean
    html: string
  }

  type DataSource = {
    id: string
    name: string
  }
  type CreatePageResponse = {
    result: string
    dataSource: DataSource
    error?: string
  }

  interface HTMLFile {
    name: string
    html: string
    metadata: Partial<PageData>
  }

  type ContentScriptResponse = (resp: any) => void
}
