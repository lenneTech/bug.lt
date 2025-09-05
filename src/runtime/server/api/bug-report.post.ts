import { createError, defineEventHandler, readBody } from 'h3'
import { createLinearIssueFromBugReport } from '../../utils/linearApi'
import type { BugReportConfig, BugReportData } from '../../types'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const config: BugReportConfig = runtimeConfig.bugLt as BugReportConfig

  // Check if Linear API is configured
  if (!config.linearApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Linear API is not configured. Please set linearApiKey.',
    })
  }

  try {
    // Parse the bug report data
    const bugReportData: BugReportData = await readBody(event)

    // Validate required fields
    if (!bugReportData.title || !bugReportData.type || !bugReportData.description) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: title, type, and description are required',
      })
    }

    // Create issue in Linear
    const result = await createLinearIssueFromBugReport(bugReportData, {
      apiKey: config.linearApiKey,
      teamName: config.linearTeamName,
      projectName: config.linearProjectName,
    })

    if (!result.success) {
      throw createError({
        statusCode: 500,
        statusMessage: result.error || 'Failed to create Linear issue',
      })
    }

    // Return success response
    return {
      success: true,
      issueId: result.issueId,
      issueUrl: result.issueUrl,
      message: 'Bug report submitted successfully',
    }
  }
  catch (error: any) {
    // If it's already an H3 error, re-throw it
    if (error?.statusCode) {
      throw error
    }

    // Handle other errors
    console.error('Bug report submission error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while processing bug report',
    })
  }
})
