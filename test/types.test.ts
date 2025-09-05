import { describe, expect, it } from 'vitest'
import type {
  BrowserInfo,
  BugReportConfig,
  BugReportData,
  BugReportPosition,
  BugReportType,
  ConsoleLogEntry,
  LinearIssueData,
  UseBugReportReturn,
} from '../src/runtime/types'

describe('Type Definitions', () => {
  it('should define BugReportType correctly', () => {
    const validTypes: BugReportType[] = ['bug', 'feature', 'enhancement', 'other']

    validTypes.forEach((type) => {
      const bugReport: BugReportData = {
        title: 'Test',
        type,
        description: 'Test desc',
      }
      expect(bugReport.type).toBe(type)
    })
  })

  it('should define BugReportPosition correctly', () => {
    const validPositions: BugReportPosition[] = [
      'bottom-right',
      'bottom-left',
      'top-right',
      'top-left',
    ]

    validPositions.forEach((position) => {
      const config: BugReportConfig = {
        position,
        autoShow: true,
        buttonColor: '#ff0000',
        buttonText: 'Test',
        buttonIcon: 'test-icon',
        enableScreenshot: true,
        enableBrowserInfo: true,
        enableConsoleLogs: true,
        theme: 'auto',
        maxConsoleLogs: 50,
      }
      expect(config.position).toBe(position)
    })
  })

  it('should define BrowserInfo structure correctly', () => {
    const browserInfo: BrowserInfo = {
      userAgent: 'Mozilla/5.0 Test',
      language: 'de-DE',
      platform: 'MacIntel',
      cookieEnabled: true,
      onLine: true,
      vendor: 'Google Inc.',
      url: 'https://example.com',
      referrer: 'https://google.com',
      title: 'Test Page',
      viewport: {
        width: 1920,
        height: 1080,
      },
      screen: {
        width: 1920,
        height: 1080,
        colorDepth: 24,
        pixelDepth: 24,
      },
      browser: {
        name: 'Chrome',
        version: '120.0.0',
      },
      os: {
        name: 'macOS',
        version: '14.0',
      },
      languages: ['de-DE', 'de', 'en-US', 'en'],
      timezone: 'Europe/Berlin',
      timestamp: '2024-01-01T00:00:00.000Z',
      performance: {
        loadTime: 1000,
        domContentLoaded: 500,
        firstPaint: 300,
        firstContentfulPaint: 400,
        navigationStart: 1000,
        responseEnd: 1200,
        domComplete: 1800,
      },
    }

    expect(browserInfo.userAgent).toBe('Mozilla/5.0 Test')
    expect(browserInfo.viewport.width).toBe(1920)
    expect(browserInfo.screen.colorDepth).toBe(24)
    expect(browserInfo.browser.name).toBe('Chrome')
    expect(browserInfo.os.name).toBe('macOS')
    expect(browserInfo.performance?.loadTime).toBe(1000)
  })

  it('should define ConsoleLogEntry correctly', () => {
    const validLevels: ConsoleLogEntry['level'][] = ['log', 'info', 'warn', 'error', 'debug']

    validLevels.forEach((level) => {
      const logEntry: ConsoleLogEntry = {
        level,
        message: ['Test message'],
        timestamp: '2024-01-01T00:00:00.000Z',
        stack: 'Error stack trace',
      }
      expect(logEntry.level).toBe(level)
      expect(logEntry.message).toEqual(['Test message'])
    })
  })

  it('should define BugReportData with all optional fields', () => {
    const fullBugReport: BugReportData = {
      title: 'Test Bug',
      type: 'bug',
      description: 'Bug description',
      expectedBehavior: 'Expected behavior',
      stepsToReproduce: 'Steps to reproduce',
      screenshot: 'data:image/png;base64,test',
      browserInfo: {} as BrowserInfo,
      consoleLogs: [] as ConsoleLogEntry[],
      customData: { key: 'value' },
    }

    expect(fullBugReport.title).toBe('Test Bug')
    expect(fullBugReport.expectedBehavior).toBe('Expected behavior')
    expect(fullBugReport.customData).toEqual({ key: 'value' })
  })

  it('should define minimal BugReportData', () => {
    const minimalBugReport: BugReportData = {
      title: 'Minimal Bug',
      type: 'other',
      description: 'Simple description',
    }

    expect(minimalBugReport.title).toBe('Minimal Bug')
    expect(minimalBugReport.expectedBehavior).toBeUndefined()
    expect(minimalBugReport.screenshot).toBeUndefined()
  })

  it('should define LinearIssueData correctly', () => {
    const linearIssue: LinearIssueData = {
      title: 'Linear Issue',
      description: 'Issue description',
      teamId: 'team-123',
      projectId: 'project-456',
      labelIds: ['label-1', 'label-2'],
    }

    expect(linearIssue.teamId).toBe('team-123')
    expect(linearIssue.projectId).toBe('project-456')
    expect(linearIssue.labelIds).toEqual(['label-1', 'label-2'])
  })

  it('should define minimal LinearIssueData', () => {
    const minimalLinearIssue: LinearIssueData = {
      title: 'Minimal Issue',
      description: 'Issue description',
      teamId: 'team-123',
    }

    expect(minimalLinearIssue.projectId).toBeUndefined()
    expect(minimalLinearIssue.labelIds).toBeUndefined()
  })

  it('should define BugReportConfig with all fields', () => {
    const fullConfig: BugReportConfig = {
      linearApiKey: 'test-key',
      linearTeamName: 'Test Team',
      linearProjectName: 'Test Project',
      autoShow: true,
      position: 'bottom-right',
      buttonColor: '#ff0000',
      buttonText: 'Bug Report',
      buttonIcon: 'bug-icon',
      enableScreenshot: true,
      enableBrowserInfo: true,
      enableConsoleLogs: true,
      theme: 'dark',
      maxConsoleLogs: 100,
    }

    expect(fullConfig.linearApiKey).toBe('test-key')
    expect(fullConfig.theme).toBe('dark')
    expect(fullConfig.maxConsoleLogs).toBe(100)
  })

  it('should define UseBugReportReturn interface', () => {
    // This tests that the interface is properly defined
    // The actual implementation test is in composables test
    const mockReturn: UseBugReportReturn = {
      openModal: async () => {
      },
      submitBugReport: async () => {
      },
      isSubmitting: { value: false } as any,
      error: { value: null } as any,
      previewScreenshot: { value: null } as any,
      capturingScreenshot: { value: false } as any,
    }

    expect(typeof mockReturn.openModal).toBe('function')
    expect(typeof mockReturn.submitBugReport).toBe('function')
    expect(mockReturn.isSubmitting.value).toBe(false)
  })

  it('should allow theme values to be properly typed', () => {
    const themes: BugReportConfig['theme'][] = ['light', 'dark', 'auto']

    themes.forEach((theme) => {
      const config: BugReportConfig = {
        autoShow: true,
        position: 'bottom-right',
        buttonColor: '#000000',
        buttonText: 'Test',
        buttonIcon: 'test',
        enableScreenshot: true,
        enableBrowserInfo: true,
        enableConsoleLogs: true,
        theme,
        maxConsoleLogs: 50,
      }
      expect(config.theme).toBe(theme)
    })
  })
})
