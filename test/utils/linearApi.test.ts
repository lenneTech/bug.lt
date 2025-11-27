import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LinearApiClient, formatBugReportForLinear } from '../../src/runtime/utils/linearApi'
import type { BugReportData } from '../../src/runtime/types'

// Mock fetch globally
global.fetch = vi.fn()

describe('LinearApiClient', () => {
  let client: LinearApiClient
  const mockApiKey = 'lin_api_test_key'

  beforeEach(() => {
    client = new LinearApiClient(mockApiKey)
    vi.clearAllMocks()
  })

  describe('graphqlRequest', () => {
    it('should make successful GraphQL requests', async () => {
      const mockResponse = {
        data: { test: 'success' },
      }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await (client as any).graphqlRequest('query { test }')

      expect(fetch).toHaveBeenCalledWith('https://api.linear.app/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': mockApiKey,
        },
        body: JSON.stringify({
          query: 'query { test }',
          variables: {},
        }),
      })

      expect(result).toEqual({ test: 'success' })
    })

    it('should handle GraphQL errors', async () => {
      const mockErrorResponse = {
        errors: [{ message: 'Test error' }],
      }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockErrorResponse),
      })

      await expect((client as any).graphqlRequest('query { test }')).rejects.toThrow(
        'Linear GraphQL error: [{"message":"Test error"}]',
      )
    })

    it('should handle HTTP errors', async () => {
      ;(fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: () => Promise.resolve('Unauthorized'),
      })

      await expect((client as any).graphqlRequest('query { test }')).rejects.toThrow(
        'Linear API request failed: 401 Unauthorized - Unauthorized',
      )
    })
  })

  describe('getTeams', () => {
    it('should fetch teams successfully', async () => {
      const mockTeamsResponse = {
        teams: {
          nodes: [
            { id: '1', name: 'Team 1', key: 'T1' },
            { id: '2', name: 'Team 2', key: 'T2' },
          ],
        },
      }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockTeamsResponse }),
      })

      const teams = await client.getTeams()

      expect(teams).toEqual([
        { id: '1', name: 'Team 1', key: 'T1' },
        { id: '2', name: 'Team 2', key: 'T2' },
      ])
    })

    it('should return empty array on error', async () => {
      ;(fetch as any).mockRejectedValueOnce(new Error('Network error'))

      const teams = await client.getTeams()

      expect(teams).toEqual([])
    })
  })

  describe('createIssue', () => {
    it('should create issue successfully', async () => {
      const mockIssueResponse = {
        issueCreate: {
          success: true,
          issue: {
            id: 'issue-1',
            url: 'https://linear.app/test/issue/1',
            identifier: 'T-1',
            title: 'Test Issue',
          },
        },
      }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockIssueResponse }),
      })

      const issueData = {
        title: 'Test Issue',
        description: 'Test Description',
        teamId: 'team-1',
      }

      const result = await client.createIssue(issueData)

      expect(result).toEqual({
        success: true,
        issueId: 'issue-1',
        issueUrl: 'https://linear.app/test/issue/1',
      })
    })
  })

  describe('uploadAttachment', () => {
    it('should upload attachment successfully', async () => {
      const mockFileUploadResponse = {
        fileUpload: {
          success: true,
          uploadFile: {
            uploadUrl: 'https://storage.googleapis.com/test-upload-url',
            assetUrl: 'https://uploads.linear.app/test-asset-url',
            headers: [
              { key: 'Content-Type', value: 'image/png' },
            ],
          },
        },
      }

      // Mock Linear GraphQL response
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockFileUploadResponse }),
      })

      // Mock file upload to Google Cloud Storage
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
      })

      const mockFile = new Blob(['test'], { type: 'image/png' })
      const result = await client.uploadAttachment(mockFile, 'test.png')

      expect(result).toEqual({
        success: true,
        attachmentId: 'https://uploads.linear.app/test-asset-url',
      })
    })
  })
})

describe('formatBugReportForLinear', () => {
  it('should format bug report with all sections', () => {
    const bugReport: BugReportData = {
      title: 'Test Bug',
      type: 'bug',
      description: 'Bug description',
      expectedBehavior: 'Expected behavior',
      stepsToReproduce: 'Steps to reproduce',
      screenshot: 'data:image/png;base64,test',
      attachments: [
        {
          id: 'test-1',
          name: 'screenshot.png',
          type: 'image/png',
          size: 1000,
          data: 'data:image/png;base64,test',
          isScreenshot: true,
        },
      ],
      browserInfo: {
        userAgent: 'Mozilla/5.0 Test',
        language: 'de-DE',
        platform: 'MacIntel',
        cookieEnabled: true,
        onLine: true,
        vendor: 'Google Inc.',
        url: 'https://example.com',
        referrer: '',
        title: 'Test Page',
        viewport: { width: 1920, height: 1080 },
        screen: { width: 1920, height: 1080, colorDepth: 24, pixelDepth: 24 },
        browser: { name: 'Chrome', version: '120.0.0' },
        os: { name: 'macOS', version: '14.0' },
        languages: ['de-DE', 'de', 'en-US', 'en'],
        timezone: 'Europe/Berlin',
        timestamp: '2024-01-01T00:00:00.000Z',
      },
      consoleLogs: [
        {
          level: 'error',
          message: ['Test error'],
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      ],
    }

    const result = formatBugReportForLinear(bugReport)

    expect(result.title).toBe('BUG: Test Bug')
    // New structure: Bug Report section with German labels
    expect(result.description).toContain('## Bug Report')
    expect(result.description).toContain('**Beschreibung:**\nBug description')
    expect(result.description).toContain('**Erwartetes Verhalten:**\nExpected behavior')
    expect(result.description).toContain('**Schritte zur Reproduktion:**\nSteps to reproduce')
    // Compact context section
    expect(result.description).toContain('## Kontext')
    expect(result.description).toContain('| **URL** | https://example.com |')
    expect(result.description).toContain('| **Browser** | Chrome 120.0.0 |')
    // Technical details in <details> tags
    expect(result.description).toContain('## Technische Details')
    expect(result.description).toContain('<details>')
    expect(result.description).toContain('<summary>Console Logs (1)</summary>')
    expect(result.description).toContain('[2024-01-01T00:00:00.000Z] ERROR: Test error')
    // Attachments note
    expect(result.description).toContain('*1 Screenshot(s) angehängt*')
  })

  it('should handle minimal bug report', () => {
    const bugReport: BugReportData = {
      title: 'Minimal Bug',
      type: 'feature',
      description: 'Simple description',
    }

    const result = formatBugReportForLinear(bugReport)

    expect(result.title).toBe('FEATURE: Minimal Bug')
    expect(result.description).toContain('## Bug Report')
    expect(result.description).toContain('**Beschreibung:**\nSimple description')
  })
})
