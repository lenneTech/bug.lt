export type BugReportType = 'bug' | 'feature' | 'enhancement' | 'other'

export type BugReportPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

export interface BrowserInfo {
  userAgent: string
  language: string
  platform: string
  cookieEnabled: boolean
  onLine: boolean
  vendor: string
  url: string
  referrer: string
  title: string
  viewport: {
    width: number
    height: number
  }
  screen: {
    width: number
    height: number
    colorDepth: number
    pixelDepth: number
  }
  browser: {
    name: string
    version?: string
  }
  os: {
    name: string
    version: string
  }
  languages: string[]
  timezone: string
  timestamp: string
  performance?: {
    loadTime: number
    domContentLoaded: number
    firstPaint: number | null
    firstContentfulPaint: number | null
    navigationStart: number
    responseEnd: number
    domComplete: number
  }
}

export interface ConsoleLogEntry {
  level: 'log' | 'info' | 'warn' | 'error' | 'debug'
  message: string[]
  timestamp: string
  stack?: string
}

export interface AttachmentFile {
  id: string
  name: string
  type: string
  size: number
  data: string | File
  isScreenshot?: boolean
  preview?: string
}

export interface BugReportData {
  title: string
  type: BugReportType
  description: string
  expectedBehavior?: string
  stepsToReproduce?: string
  screenshot?: string
  attachments?: AttachmentFile[]
  browserInfo?: BrowserInfo
  consoleLogs?: ConsoleLogEntry[]
  customData?: Record<string, any>
}

export interface LinearIssueData {
  title: string
  description: string
  teamId: string
  projectId?: string
  labelIds?: string[]
}

export interface BugReportConfig {
  enabled?: boolean
  linearApiKey?: string
  linearTeamName?: string
  linearProjectName?: string
  autoShow?: boolean
  position?: BugReportPosition
  buttonColor?: string
  buttonText?: string
  buttonIcon?: string
  enableScreenshot?: boolean
  enableBrowserInfo?: boolean
  enableConsoleLogs?: boolean
  theme?: 'light' | 'dark' | 'auto'
  customCSS?: string
  maxConsoleLogs?: number
}

export interface UseBugReportReturn {
  openModal: () => Promise<void>
  submitBugReport: (data: BugReportData) => Promise<void>
  isSubmitting: Ref<boolean>
  error: Ref<string | null>
  previewScreenshot: Ref<string | null>
  capturingScreenshot: Ref<boolean>
}
