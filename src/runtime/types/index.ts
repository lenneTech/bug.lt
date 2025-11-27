import type { Ref } from 'vue'

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

export interface NetworkRequestEntry {
  method: string
  url: string
  status: number
  statusText: string
  timestamp: string
  duration?: number
  requestHeaders?: Record<string, string>
  responseHeaders?: Record<string, string>
  requestBody?: string
  responseBody?: string
  error?: string
  type: 'fetch' | 'xhr'
}

export type UserInteractionType
  = | 'click'
    | 'navigation'
    | 'form_submit'
    | 'form_change'
    | 'input_change'
    | 'hover'
    | 'scroll'
    | 'keyboard'
    | 'modal_open'
    | 'modal_close'
    | 'error'

export interface UserInteractionEvent {
  type: UserInteractionType
  target: string
  timestamp: string
  metadata?: {
    element?: string
    tag?: string
    id?: string
    classes?: string[]
    text?: string
    value?: string
    url?: string
    fromUrl?: string
    toUrl?: string
    key?: string
    scrollPosition?: number
    errorMessage?: string
    [key: string]: any
  }
}

export interface ErrorInfo {
  message: string
  stack?: string
  componentName?: string
  timestamp: string
  url?: string
  userAgent?: string
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
  networkRequests?: NetworkRequestEntry[]
  userInteractions?: UserInteractionEvent[]
  customData?: Record<string, any>
}

export interface LinearIssueData {
  title: string
  description: string
  teamId: string
  projectId?: string
  labelIds?: string[]
}

export interface UserJourneyConfig {
  enabled?: boolean
  maxEvents?: number
  captureClicks?: boolean
  captureNavigation?: boolean
  captureFormInteractions?: boolean
  captureHover?: boolean
  captureScroll?: boolean
  captureInputChanges?: boolean
  captureInputValues?: boolean
  captureKeyboard?: boolean
  captureErrors?: boolean
  captureModalEvents?: boolean
  throttleRate?: number
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
  enableNetworkRequests?: boolean
  enableErrorBoundary?: boolean
  enableUserJourney?: boolean
  autoOpenOnError?: boolean
  theme?: 'light' | 'dark' | 'auto'
  maxConsoleLogs?: number
  maxNetworkRequests?: number
  userJourney?: UserJourneyConfig
}

export interface UseBugReportReturn {
  openModal: (errorInfo?: ErrorInfo) => Promise<void>
  submitBugReport: (data: BugReportData) => Promise<void>
  getUserJourney: () => UserInteractionEvent[]
  isSubmitting: Ref<boolean>
  error: Ref<string | null>
  previewScreenshot: Ref<string | null>
  capturingScreenshot: Ref<boolean>
  lastError: Ref<ErrorInfo | null>
}
