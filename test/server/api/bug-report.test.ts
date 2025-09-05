import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createError, readBody } from 'h3'
import bugReportHandler from '../../../src/runtime/server/api/bug-report.post'

import { createLinearIssueFromBugReport } from '../../../src/runtime/utils/linearApi'

// Mock h3 functions
vi.mock('h3', () => ({
  defineEventHandler: (handler: any) => handler,
  readBody: vi.fn(),
  createError: vi.fn().mockImplementation(({ statusCode, statusMessage }) => {
    const error = new Error(statusMessage)
    ;(error as any).statusCode = statusCode
    return error
  }),
}))

// Mock useRuntimeConfig
let mockRuntimeConfig = {
  bugLt: {
    linearApiKey: 'test-api-key',
    linearTeamName: 'Test Team',
    linearProjectName: 'Test Project',
  },
}

global.useRuntimeConfig = vi.fn(() => mockRuntimeConfig)

// Mock Linear API
vi.mock('../../../src/runtime/utils/linearApi', () => ({
  createLinearIssueFromBugReport: vi.fn(),
}))

describe('bug-report API handler', () => {
  const mockEvent = {} as any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create issue successfully', async () => {
    const mockBugReportData = {
      title: 'Test Bug',
      type: 'bug',
      description: 'Test description',
    }

    const mockLinearResponse = {
      success: true,
      issueId: 'test-issue-id',
      issueUrl: 'https://linear.app/test/issue/1',
    }

    ;(readBody as any).mockResolvedValueOnce(mockBugReportData)
    ;(createLinearIssueFromBugReport as any).mockResolvedValueOnce(mockLinearResponse)

    const result = await bugReportHandler(mockEvent)

    expect(readBody).toHaveBeenCalledWith(mockEvent)
    expect(createLinearIssueFromBugReport).toHaveBeenCalledWith(mockBugReportData, {
      apiKey: 'test-api-key',
      teamName: 'Test Team',
      projectName: 'Test Project',
    })

    expect(result).toEqual({
      success: true,
      issueId: 'test-issue-id',
      issueUrl: 'https://linear.app/test/issue/1',
      message: 'Bug report submitted successfully',
    })
  })

  it('should throw error when Linear API key is missing', async () => {
    // Update the mock config to not have API key
    mockRuntimeConfig = {
      bugLt: {
        linearTeamName: 'Test Team',
        linearProjectName: 'Test Project',
      },
    } as any

    await expect(bugReportHandler(mockEvent)).rejects.toThrow()

    expect(createError).toHaveBeenCalledWith({
      statusCode: 500,
      statusMessage: 'Linear API is not configured. Please set linearApiKey.',
    })

    // Reset config for other tests
    mockRuntimeConfig = {
      bugLt: {
        linearApiKey: 'test-api-key',
        linearTeamName: 'Test Team',
        linearProjectName: 'Test Project',
      },
    }
  })

  it('should throw error for missing required fields', async () => {
    const invalidBugReportData = {
      title: 'Test Bug',
      // Missing type and description
    }

    ;(readBody as any).mockResolvedValueOnce(invalidBugReportData)

    await expect(bugReportHandler(mockEvent)).rejects.toThrow()

    expect(createError).toHaveBeenCalledWith({
      statusCode: 400,
      statusMessage: 'Missing required fields: title, type, and description are required',
    })
  })

  it('should handle Linear API errors', async () => {
    const mockBugReportData = {
      title: 'Test Bug',
      type: 'bug',
      description: 'Test description',
    }

    const mockLinearErrorResponse = {
      success: false,
      error: 'Linear API error',
    }

    ;(readBody as any).mockResolvedValueOnce(mockBugReportData)
    ;(createLinearIssueFromBugReport as any).mockResolvedValueOnce(mockLinearErrorResponse)

    await expect(bugReportHandler(mockEvent)).rejects.toThrow()

    expect(createError).toHaveBeenCalledWith({
      statusCode: 500,
      statusMessage: 'Linear API error',
    })
  })

  it('should handle generic errors', async () => {
    const mockBugReportData = {
      title: 'Test Bug',
      type: 'bug',
      description: 'Test description',
    }

    ;(readBody as any).mockResolvedValueOnce(mockBugReportData)
    ;(createLinearIssueFromBugReport as any).mockRejectedValueOnce(new Error('Network error'))

    await expect(bugReportHandler(mockEvent)).rejects.toThrow()

    expect(createError).toHaveBeenCalledWith({
      statusCode: 500,
      statusMessage: 'Internal server error while processing bug report',
    })
  })

  it('should re-throw H3 errors unchanged', async () => {
    const mockBugReportData = {
      title: 'Test Bug',
      type: 'bug',
      description: 'Test description',
    }

    const h3Error = new Error('H3 error')
    ;(h3Error as any).statusCode = 401

    ;(readBody as any).mockResolvedValueOnce(mockBugReportData)
    ;(createLinearIssueFromBugReport as any).mockRejectedValueOnce(h3Error)

    await expect(bugReportHandler(mockEvent)).rejects.toThrow(h3Error)

    // Should not create a new error, but re-throw the existing one
    expect(createError).not.toHaveBeenCalled()
  })

  it('should validate all required fields', async () => {
    const testCases = [
      { title: undefined, type: 'bug', description: 'desc' },
      { title: 'title', type: undefined, description: 'desc' },
      { title: 'title', type: 'bug', description: undefined },
      { title: '', type: 'bug', description: 'desc' },
      { title: 'title', type: '', description: 'desc' },
      { title: 'title', type: 'bug', description: '' },
    ]

    for (const testCase of testCases) {
      ;(readBody as any).mockResolvedValueOnce(testCase)

      await expect(bugReportHandler(mockEvent)).rejects.toThrow()

      expect(createError).toHaveBeenLastCalledWith({
        statusCode: 400,
        statusMessage: 'Missing required fields: title, type, and description are required',
      })
    }
  })

  it('should pass all configuration to Linear API', async () => {
    const mockBugReportData = {
      title: 'Test Bug',
      type: 'bug',
      description: 'Test description',
    }

    const mockLinearResponse = {
      success: true,
      issueId: 'test-issue-id',
      issueUrl: 'https://linear.app/test/issue/1',
    }

    ;(readBody as any).mockResolvedValueOnce(mockBugReportData)
    ;(createLinearIssueFromBugReport as any).mockResolvedValueOnce(mockLinearResponse)

    await bugReportHandler(mockEvent)

    expect(createLinearIssueFromBugReport).toHaveBeenCalledWith(mockBugReportData, {
      apiKey: 'test-api-key',
      teamName: 'Test Team',
      projectName: 'Test Project',
    })
  })
})
