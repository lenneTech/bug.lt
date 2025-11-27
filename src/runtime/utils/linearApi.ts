import type { BugReportData, LinearIssueData } from '../types'

export interface LinearIssueResponse {
  success: boolean
  issueId?: string
  issueUrl?: string
  error?: string
}

export class LinearApiClient {
  private apiKey: string
  private baseUrl = 'https://api.linear.app/graphql'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async graphqlRequest<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.apiKey,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    })

    if (!response.ok) {
      const responseText = await response.text()
      console.error('Linear API - Error Response Body:', responseText)
      throw new Error(`Linear API request failed: ${response.status} ${response.statusText} - ${responseText}`)
    }

    const result = await response.json()

    if (result.errors && result.errors.length > 0) {
      throw new Error(`Linear GraphQL error: ${JSON.stringify(result.errors)}`)
    }

    return result.data
  }

  async getTeams(): Promise<{ id: string, name: string, key: string }[]> {
    const query = `
      query GetTeams {
        teams {
          nodes {
            id
            name
            key
          }
        }
      }
    `

    try {
      const data = await this.graphqlRequest<{
        teams: {
          nodes: { id: string, name: string, key: string }[]
        }
      }>(query)

      return data.teams?.nodes || []
    }
    catch (error) {
      console.error('Failed to fetch teams:', error)
      return []
    }
  }

  async getProjects(): Promise<{ id: string, name: string }[]> {
    const query = `
      query GetProjects {
        projects {
          nodes {
            id
            name
          }
        }
      }
    `

    try {
      const data = await this.graphqlRequest<{
        projects: {
          nodes: { id: string, name: string }[]
        }
      }>(query)

      return data.projects?.nodes || []
    }
    catch (error) {
      console.error('Failed to fetch projects:', error)
      return []
    }
  }

  async getLabels(teamId: string): Promise<{ id: string, name: string }[]> {
    const query = `
      query GetLabels($teamId: String!) {
        team(id: $teamId) {
          labels(first: 100) {
            nodes {
              id
              name
            }
          }
        }
      }
    `

    try {
      const data = await this.graphqlRequest<{
        team: {
          labels: {
            nodes: { id: string, name: string }[]
          }
        }
      }>(query, { teamId })

      return data.team?.labels?.nodes || []
    }
    catch (error) {
      console.error('Failed to fetch labels:', error)
      return []
    }
  }

  async createIssue(issueData: LinearIssueData): Promise<LinearIssueResponse> {
    const mutation = `
      mutation CreateIssue($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue {
            id
            url
            identifier
            title
          }
        }
      }
    `

    const input: any = {
      title: issueData.title,
      description: issueData.description,
      teamId: issueData.teamId,
    }

    // Only add optional fields if they exist
    if (issueData.projectId) {
      input.projectId = issueData.projectId
    }

    if (issueData.labelIds && issueData.labelIds.length > 0) {
      input.labelIds = issueData.labelIds
    }

    try {
      const data = await this.graphqlRequest<{
        issueCreate: {
          success: boolean
          issue: {
            id: string
            url: string
            identifier: string
            title: string
          }
        }
      }>(mutation, { input })

      return {
        success: data.issueCreate.success,
        issueId: data.issueCreate.issue.id,
        issueUrl: data.issueCreate.issue.url,
      }
    }
    catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  async createLabel(teamId: string, name: string, color: string): Promise<{
    success: boolean
    labelId?: string
    error?: string
  }> {
    const mutation = `
      mutation CreateLabel($input: IssueLabelCreateInput!) {
        issueLabelCreate(input: $input) {
          success
          issueLabel {
            id
            name
          }
        }
      }
    `

    try {
      const data = await this.graphqlRequest<{
        issueLabelCreate: {
          success: boolean
          issueLabel: {
            id: string
            name: string
          }
        }
      }>(mutation, {
        input: {
          teamId,
          name,
          color,
        },
      })

      return {
        success: data.issueLabelCreate.success,
        labelId: data.issueLabelCreate.issueLabel.id,
      }
    }
    catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  async createAttachment(issueId: string, url: string, filename: string): Promise<{
    success: boolean
    attachmentId?: string
    error?: string
  }> {
    const mutation = `
      mutation CreateAttachment($input: AttachmentCreateInput!) {
        attachmentCreate(input: $input) {
          success
          attachment {
            id
          }
        }
      }
    `

    try {
      const data = await this.graphqlRequest<{
        attachmentCreate: {
          success: boolean
          attachment: {
            id: string
          }
        }
      }>(mutation, {
        input: {
          issueId,
          url,
          title: filename,
        },
      })

      return {
        success: data.attachmentCreate.success,
        attachmentId: data.attachmentCreate.attachment.id,
      }
    }
    catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  async uploadAttachment(file: Blob, filename: string): Promise<{
    success: boolean
    attachmentId?: string
    error?: string
  }> {
    // Validate file size
    if (!file.size || file.size === 0) {
      return {
        success: false,
        error: `File ${filename} has zero size`,
      }
    }
    return this.uploadAttachmentWithSize(file, filename, file.size, file.type)
  }

  async uploadAttachmentWithSize(file: Blob, filename: string, size: number, contentType: string): Promise<{
    success: boolean
    attachmentId?: string
    error?: string
  }> {
    // Validate file size
    if (!size || size === 0) {
      return {
        success: false,
        error: `File ${filename} has zero size`,
      }
    }
    const mutation = `
      mutation FileUpload($contentType: String!, $filename: String!, $size: Int!) {
        fileUpload(contentType: $contentType, filename: $filename, size: $size) {
          success
          uploadFile {
            uploadUrl
            assetUrl
            headers {
              key
              value
            }
          }
        }
      }
    `

    try {
      // First, get upload URL from Linear
      const uploadData = await this.graphqlRequest<{
        fileUpload: {
          success: boolean
          uploadFile: {
            uploadUrl: string
            assetUrl: string
            headers: Array<{ key: string, value: string }>
          }
        }
      }>(mutation, {
        contentType,
        filename,
        size,
      })

      if (!uploadData.fileUpload.success) {
        throw new Error('Failed to get upload URL from Linear')
      }

      // Upload file to the provided URL
      const uploadUrl = uploadData.fileUpload.uploadFile.uploadUrl
      const assetUrl = uploadData.fileUpload.uploadFile.assetUrl
      const requiredHeaders = uploadData.fileUpload.uploadFile.headers

      // Create headers object from Linear's response
      const headers = new Headers()
      headers.set('Content-Type', contentType)

      // Add all headers provided by Linear
      requiredHeaders.forEach(({ key, value }) => {
        headers.set(key, value)
      })

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers,
      })

      if (!uploadResponse.ok) {
        const responseText = await uploadResponse.text()
        throw new Error(`Failed to upload file: ${uploadResponse.status} ${uploadResponse.statusText} - ${responseText}`)
      }

      return {
        success: true,
        attachmentId: assetUrl,
      }
    }
    catch (error: any) {
      return {
        success: false,
        error: error.message,
      }
    }
  }
}

export const formatBugReportForLinear = (bugReport: BugReportData): Partial<LinearIssueData> => {
  const sections: string[] = []

  // === SECTION 1: Bug Report (most important, always first) ===
  const bugReportParts: string[] = []

  if (bugReport.description) {
    bugReportParts.push(`**Beschreibung:**\n${bugReport.description}`)
  }

  if (bugReport.expectedBehavior) {
    bugReportParts.push(`**Erwartetes Verhalten:**\n${bugReport.expectedBehavior}`)
  }

  if (bugReport.stepsToReproduce) {
    bugReportParts.push(`**Schritte zur Reproduktion:**\n${bugReport.stepsToReproduce}`)
  }

  if (bugReportParts.length > 0) {
    sections.push(`## Bug Report\n\n${bugReportParts.join('\n\n')}`)
  }

  // === SECTION 2: Context (compact browser info) ===
  if (bugReport.browserInfo) {
    const info = bugReport.browserInfo
    const browserName = info.browser?.name || 'Unknown'
    const browserVersion = info.browser?.version || ''
    const osName = info.os?.name || info.platform || 'Unknown'
    const osVersion = info.os?.version || ''

    const contextSection = `---

## Kontext

| | |
|---|---|
| **URL** | ${info.url} |
| **Browser** | ${browserName} ${browserVersion} |
| **OS** | ${osName} ${osVersion} |
| **Viewport** | ${info.viewport.width}x${info.viewport.height} |
| **Zeitpunkt** | ${info.timestamp} |`

    sections.push(contextSection)
  }

  // === SECTION 3: User Journey (important for reproduction) ===
  if (bugReport.userInteractions && bugReport.userInteractions.length > 0) {
    const interactions = bugReport.userInteractions

    const formatEventType = (type: string): string => {
      return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    const formatTimestamp = (timestamp: string): string => {
      const date = new Date(timestamp)
      return date.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    }

    const formatDetails = (event: typeof interactions[0]): string => {
      const metadata = event.metadata
      if (!metadata) return ''

      if (metadata.toUrl) return `→ ${metadata.toUrl.substring(0, 50)}`
      if (metadata.text) return metadata.text.substring(0, 40)
      if (metadata.errorMessage) return `Error: ${metadata.errorMessage.substring(0, 40)}`
      if (metadata.key) return `Key: ${metadata.key}`

      return ''
    }

    const userJourneySection = `---

## User Journey

> Letzte ${interactions.length} Aktionen vor dem Bug

| Zeit | Aktion | Element | Details |
|------|--------|---------|---------|
${interactions.map((event) => {
  const time = formatTimestamp(event.timestamp)
  const type = formatEventType(event.type)
  const target = event.target.length > 40 ? event.target.substring(0, 37) + '...' : event.target
  const details = formatDetails(event)
  return `| ${time} | ${type} | ${target} | ${details} |`
}).join('\n')}`

    sections.push(userJourneySection)
  }

  // === SECTION 4: Technical Details (collapsible) ===
  const technicalParts: string[] = []

  // Console Logs
  if (bugReport.consoleLogs && bugReport.consoleLogs.length > 0) {
    const logs = bugReport.consoleLogs.slice(-10)
    const logsContent = logs
      .map(log => `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message.join(' ')}`)
      .join('\n')

    technicalParts.push(`### Console Logs (${logs.length})

\`\`\`
${logsContent}
\`\`\``)
  }

  // Network Requests
  if (bugReport.networkRequests && bugReport.networkRequests.length > 0) {
    const requests = bugReport.networkRequests.slice(-10)
    const failedRequests = requests.filter(req => req.status >= 400 || req.status === 0)

    let networkContent = `| Method | URL | Status |
|--------|-----|--------|
${requests.map((req) => {
  const url = req.url.length > 60 ? req.url.substring(0, 57) + '...' : req.url
  const status = req.status === 0 ? 'ERR' : req.status
  return `| ${req.method} | ${url} | ${status} |`
}).join('\n')}`

    if (failedRequests.length > 0) {
      networkContent += `\n\n**Fehlerhafte Requests:**\n${failedRequests.map((req) => {
        return `- ${req.method} ${req.url.substring(0, 60)} → ${req.status} ${req.statusText}`
      }).join('\n')}`
    }

    technicalParts.push(`### Network Requests (${requests.length})

${networkContent}`)
  }

  if (technicalParts.length > 0) {
    sections.push(`---

## Technische Details

${technicalParts.join('\n\n')}`)
  }

  // === SECTION 5: Attachments note ===
  if (bugReport.attachments && bugReport.attachments.length > 0) {
    const screenshotCount = bugReport.attachments.filter(a => a.isScreenshot).length
    const otherCount = bugReport.attachments.length - screenshotCount

    let attachmentText = ''
    if (screenshotCount > 0 && otherCount > 0) {
      attachmentText = `*${screenshotCount} Screenshot(s) und ${otherCount} weitere Anhänge*`
    }
    else if (screenshotCount > 0) {
      attachmentText = `*${screenshotCount} Screenshot(s) angehängt*`
    }
    else {
      attachmentText = `*${otherCount} Anhänge*`
    }

    sections.push(`---\n\n${attachmentText}`)
  }

  return {
    title: `${bugReport.type.toUpperCase()}: ${bugReport.title}`,
    description: sections.join('\n\n'),
  }
}

// Map bug report types to label names and colors
const typeToLabelMapping = {
  bug: { name: 'bug', color: '#f87171' }, // red
  feature: { name: 'feature', color: '#60a5fa' }, // blue
  enhancement: { name: 'enhancement', color: '#34d399' }, // green
  other: { name: 'other', color: '#a78bfa' }, // purple
}

const findOrCreateLabel = async (
  client: LinearApiClient,
  teamId: string,
  bugReportType: string,
): Promise<string | null> => {
  try {
    // Get existing labels for the team
    const labels = await client.getLabels(teamId)

    const labelMapping = typeToLabelMapping[bugReportType as keyof typeof typeToLabelMapping]
    if (!labelMapping) {
      console.warn(`Linear API - No label mapping found for type: ${bugReportType}`)
      return null
    }

    // Try to find existing label by name
    const existingLabel = labels.find(label =>
      label.name.toLowerCase() === labelMapping.name.toLowerCase(),
    )

    if (existingLabel) {
      return existingLabel.id
    }

    // Create new label if it doesn't exist
    const createResult = await client.createLabel(teamId, labelMapping.name, labelMapping.color)

    if (createResult.success && createResult.labelId) {
      return createResult.labelId
    }
    else {
      return null
    }
  }
  catch (error) {
    console.error('Linear API - Error managing label:', error)
    return null
  }
}

export const createLinearIssueFromBugReport = async (
  bugReport: BugReportData,
  config: { apiKey: string, teamName?: string, projectName?: string },
): Promise<LinearIssueResponse> => {
  const client = new LinearApiClient(config.apiKey)

  // Resolve team name to team ID
  let teamId: string | undefined
  if (config.teamName) {
    try {
      const teams = await client.getTeams()
      const team = teams.find(t =>
        t.name.toLowerCase() === config.teamName!.toLowerCase()
        || t.key.toLowerCase() === config.teamName!.toLowerCase(),
      )

      if (team) {
        teamId = team.id
      }
      else {
        throw new Error(`Team "${config.teamName}" not found. Available teams: ${teams.map(t => t.name).join(', ')}`)
      }
    }
    catch (error: any) {
      console.error('Linear API - Failed to resolve team:', error)
      throw new Error(`Failed to resolve team "${config.teamName}": ${error?.message}`)
    }
  }

  // Resolve project name to project ID (optional)
  let projectId: string | undefined
  if (config.projectName) {
    try {
      const projects = await client.getProjects()
      const project = projects.find(p =>
        p.name.toLowerCase() === config.projectName!.toLowerCase(),
      )

      if (project) {
        projectId = project.id
      }
    }
    catch (error) {
      console.warn('Linear API - Failed to resolve project (continuing without):', error)
    }
  }

  const issueData: LinearIssueData = formatBugReportForLinear(bugReport) as LinearIssueData
  if (teamId) {
    issueData.teamId = teamId
  }
  if (projectId) {
    issueData.projectId = projectId
  }

  // Find or create appropriate label based on bug report type
  if (teamId) {
    const labelId = await findOrCreateLabel(client, teamId, bugReport.type)
    if (labelId) {
      issueData.labelIds = [labelId]
    }
  }

  // Create the issue first
  const result = await client.createIssue(issueData)

  // If issue creation was successful and we have attachments, upload and attach them
  if (result.success && result.issueId && bugReport.attachments && bugReport.attachments.length > 0) {
    for (const attachment of bugReport.attachments) {
      try {
        // Check if data is actually a string (data URL)
        if (typeof attachment.data !== 'string') {
          console.error(`Attachment ${attachment.name} data is not a string:`, attachment.data)
          continue
        }

        // All attachment.data should now be data URLs (strings)
        const response = await fetch(attachment.data)
        const blob = await response.blob()

        // Create blob with correct content type
        const contentType = attachment.type || blob.type || 'application/octet-stream'
        const finalBlob = new Blob([blob], { type: contentType })
        const size = finalBlob.size || attachment.size || 0

        // Skip files with zero size
        if (size === 0) {
          console.warn(`Skipping attachment ${attachment.name} - zero size`)
          continue
        }

        const uploadResult = await client.uploadAttachmentWithSize(finalBlob, attachment.name, size, contentType)

        if (uploadResult.success && uploadResult.attachmentId) {
          // Create attachment and link to issue
          await client.createAttachment(result.issueId, uploadResult.attachmentId, attachment.name)
        }
      }
      catch (error) {
        console.warn(`Linear API - Failed to upload attachment "${attachment.name}" (continuing without):`, error)
      }
    }
  }

  // Also handle legacy screenshot field for backward compatibility
  if (result.success && result.issueId && bugReport.screenshot && (!bugReport.attachments || !bugReport.attachments.some(a => a.isScreenshot))) {
    try {
      // Convert data URL to blob
      const response = await fetch(bugReport.screenshot)
      const blob = await response.blob()

      // Ensure we have the right content type for PNG
      const pngBlob = new Blob([blob], { type: 'image/png' })

      const filename = `screenshot-${Date.now()}.png`
      const uploadResult = await client.uploadAttachment(pngBlob, filename)

      if (uploadResult.success && uploadResult.attachmentId) {
        // Create attachment and link to issue
        await client.createAttachment(result.issueId, uploadResult.attachmentId, filename)
      }
    }
    catch (error) {
      console.warn('Linear API - Failed to upload legacy screenshot (continuing without):', error)
    }
  }

  return result
}
