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

  interface SaveClipping {
    content: string
    pageData: PageData
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

  type CreatePageResponse = {
    result: string
    dataSource: {
      id: string
      name: string
    }
  }

  interface HTMLFile {
    name: string
    html: string
    metadata: Partial<PageData>
  }
}
