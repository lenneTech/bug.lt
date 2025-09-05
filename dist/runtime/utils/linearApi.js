export class LinearApiClient {
  apiKey;
  baseUrl = "https://api.linear.app/graphql";
  constructor(apiKey) {
    this.apiKey = apiKey;
  }
  async graphqlRequest(query, variables = {}) {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": this.apiKey
      },
      body: JSON.stringify({
        query,
        variables
      })
    });
    if (!response.ok) {
      const responseText = await response.text();
      console.error("Linear API - Error Response Body:", responseText);
      throw new Error(`Linear API request failed: ${response.status} ${response.statusText} - ${responseText}`);
    }
    const result = await response.json();
    if (result.errors && result.errors.length > 0) {
      throw new Error(`Linear GraphQL error: ${JSON.stringify(result.errors)}`);
    }
    return result.data;
  }
  async getTeams() {
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
    `;
    try {
      const data = await this.graphqlRequest(query);
      return data.teams?.nodes || [];
    } catch (error) {
      console.error("Failed to fetch teams:", error);
      return [];
    }
  }
  async getProjects() {
    const query = `
      query GetProjects {
        projects {
          nodes {
            id
            name
          }
        }
      }
    `;
    try {
      const data = await this.graphqlRequest(query);
      return data.projects?.nodes || [];
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      return [];
    }
  }
  async getLabels(teamId) {
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
    `;
    try {
      const data = await this.graphqlRequest(query, { teamId });
      return data.team?.labels?.nodes || [];
    } catch (error) {
      console.error("Failed to fetch labels:", error);
      return [];
    }
  }
  async createIssue(issueData) {
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
    `;
    const input = {
      title: issueData.title,
      description: issueData.description,
      teamId: issueData.teamId
    };
    if (issueData.projectId) {
      input.projectId = issueData.projectId;
    }
    if (issueData.labelIds && issueData.labelIds.length > 0) {
      input.labelIds = issueData.labelIds;
    }
    try {
      const data = await this.graphqlRequest(mutation, { input });
      return {
        success: data.issueCreate.success,
        issueId: data.issueCreate.issue.id,
        issueUrl: data.issueCreate.issue.url
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  async createLabel(teamId, name, color) {
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
    `;
    try {
      const data = await this.graphqlRequest(mutation, {
        input: {
          teamId,
          name,
          color
        }
      });
      return {
        success: data.issueLabelCreate.success,
        labelId: data.issueLabelCreate.issueLabel.id
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  async createAttachment(issueId, url, filename) {
    const mutation = `
      mutation CreateAttachment($input: AttachmentCreateInput!) {
        attachmentCreate(input: $input) {
          success
          attachment {
            id
          }
        }
      }
    `;
    try {
      const data = await this.graphqlRequest(mutation, {
        input: {
          issueId,
          url,
          title: filename
        }
      });
      return {
        success: data.attachmentCreate.success,
        attachmentId: data.attachmentCreate.attachment.id
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  async uploadAttachment(file, filename) {
    if (!file.size || file.size === 0) {
      return {
        success: false,
        error: `File ${filename} has zero size`
      };
    }
    return this.uploadAttachmentWithSize(file, filename, file.size, file.type);
  }
  async uploadAttachmentWithSize(file, filename, size, contentType) {
    if (!size || size === 0) {
      return {
        success: false,
        error: `File ${filename} has zero size`
      };
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
    `;
    try {
      const uploadData = await this.graphqlRequest(mutation, {
        contentType,
        filename,
        size
      });
      if (!uploadData.fileUpload.success) {
        throw new Error("Failed to get upload URL from Linear");
      }
      const uploadUrl = uploadData.fileUpload.uploadFile.uploadUrl;
      const assetUrl = uploadData.fileUpload.uploadFile.assetUrl;
      const requiredHeaders = uploadData.fileUpload.uploadFile.headers;
      const headers = new Headers();
      headers.set("Content-Type", contentType);
      requiredHeaders.forEach(({ key, value }) => {
        headers.set(key, value);
      });
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers
      });
      if (!uploadResponse.ok) {
        const responseText = await uploadResponse.text();
        throw new Error(`Failed to upload file: ${uploadResponse.status} ${uploadResponse.statusText} - ${responseText}`);
      }
      return {
        success: true,
        attachmentId: assetUrl
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
export const formatBugReportForLinear = (bugReport) => {
  const sections = [];
  if (bugReport.description) {
    sections.push(`## Description
${bugReport.description}`);
  }
  if (bugReport.expectedBehavior) {
    sections.push(`## Expected Behavior
${bugReport.expectedBehavior}`);
  }
  if (bugReport.stepsToReproduce) {
    sections.push(`## Steps to Reproduce
${bugReport.stepsToReproduce}`);
  }
  if (bugReport.browserInfo) {
    const info = bugReport.browserInfo;
    const browserSection = `## Browser Information
- **URL**: ${info.url}
- **User Agent**: ${info.userAgent}
- **Platform**: ${info.platform}
- **Language**: ${info.language}
- **Viewport**: ${info.viewport.width}x${info.viewport.height}
- **Screen**: ${info.screen.width}x${info.screen.height}
- **Timestamp**: ${info.timestamp}`;
    sections.push(browserSection);
  }
  if (bugReport.consoleLogs && bugReport.consoleLogs.length > 0) {
    const logsSection = `## Logs
\`\`\`
${bugReport.consoleLogs.slice(-10).map((log) => `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message.join(" ")}`).join("\n")}
\`\`\``;
    sections.push(logsSection);
  }
  if (bugReport.attachments && bugReport.attachments.length > 0) {
    const attachmentNames = bugReport.attachments.map((a) => a.name).join(", ");
    sections.push(`## Attachments
*${bugReport.attachments.length} file(s) attached: ${attachmentNames}*`);
  }
  return {
    title: `${bugReport.type.toUpperCase()}: ${bugReport.title}`,
    description: sections.join("\n\n")
  };
};
const typeToLabelMapping = {
  bug: { name: "bug", color: "#f87171" },
  // red
  feature: { name: "feature", color: "#60a5fa" },
  // blue
  enhancement: { name: "enhancement", color: "#34d399" },
  // green
  other: { name: "other", color: "#a78bfa" }
  // purple
};
const findOrCreateLabel = async (client, teamId, bugReportType) => {
  try {
    const labels = await client.getLabels(teamId);
    const labelMapping = typeToLabelMapping[bugReportType];
    if (!labelMapping) {
      console.warn(`Linear API - No label mapping found for type: ${bugReportType}`);
      return null;
    }
    const existingLabel = labels.find(
      (label) => label.name.toLowerCase() === labelMapping.name.toLowerCase()
    );
    if (existingLabel) {
      return existingLabel.id;
    }
    const createResult = await client.createLabel(teamId, labelMapping.name, labelMapping.color);
    if (createResult.success && createResult.labelId) {
      return createResult.labelId;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Linear API - Error managing label:", error);
    return null;
  }
};
export const createLinearIssueFromBugReport = async (bugReport, config) => {
  const client = new LinearApiClient(config.apiKey);
  let teamId;
  if (config.teamName) {
    try {
      const teams = await client.getTeams();
      const team = teams.find(
        (t) => t.name.toLowerCase() === config.teamName.toLowerCase() || t.key.toLowerCase() === config.teamName.toLowerCase()
      );
      if (team) {
        teamId = team.id;
      } else {
        throw new Error(`Team "${config.teamName}" not found. Available teams: ${teams.map((t) => t.name).join(", ")}`);
      }
    } catch (error) {
      console.error("Linear API - Failed to resolve team:", error);
      throw new Error(`Failed to resolve team "${config.teamName}": ${error?.message}`);
    }
  }
  let projectId;
  if (config.projectName) {
    try {
      const projects = await client.getProjects();
      const project = projects.find(
        (p) => p.name.toLowerCase() === config.projectName.toLowerCase()
      );
      if (project) {
        projectId = project.id;
      }
    } catch (error) {
      console.warn("Linear API - Failed to resolve project (continuing without):", error);
    }
  }
  const issueData = formatBugReportForLinear(bugReport);
  if (teamId) {
    issueData.teamId = teamId;
  }
  if (projectId) {
    issueData.projectId = projectId;
  }
  if (teamId) {
    const labelId = await findOrCreateLabel(client, teamId, bugReport.type);
    if (labelId) {
      issueData.labelIds = [labelId];
    }
  }
  const result = await client.createIssue(issueData);
  if (result.success && result.issueId && bugReport.attachments && bugReport.attachments.length > 0) {
    for (const attachment of bugReport.attachments) {
      try {
        if (typeof attachment.data !== "string") {
          console.error(`Attachment ${attachment.name} data is not a string:`, attachment.data);
          continue;
        }
        const response = await fetch(attachment.data);
        const blob = await response.blob();
        const contentType = attachment.type || blob.type || "application/octet-stream";
        const finalBlob = new Blob([blob], { type: contentType });
        const size = finalBlob.size || attachment.size || 0;
        if (size === 0) {
          console.warn(`Skipping attachment ${attachment.name} - zero size`);
          continue;
        }
        const uploadResult = await client.uploadAttachmentWithSize(finalBlob, attachment.name, size, contentType);
        if (uploadResult.success && uploadResult.attachmentId) {
          await client.createAttachment(result.issueId, uploadResult.attachmentId, attachment.name);
        }
      } catch (error) {
        console.warn(`Linear API - Failed to upload attachment "${attachment.name}" (continuing without):`, error);
      }
    }
  }
  if (result.success && result.issueId && bugReport.screenshot && (!bugReport.attachments || !bugReport.attachments.some((a) => a.isScreenshot))) {
    try {
      const response = await fetch(bugReport.screenshot);
      const blob = await response.blob();
      const pngBlob = new Blob([blob], { type: "image/png" });
      const filename = `screenshot-${Date.now()}.png`;
      const uploadResult = await client.uploadAttachment(pngBlob, filename);
      if (uploadResult.success && uploadResult.attachmentId) {
        await client.createAttachment(result.issueId, uploadResult.attachmentId, filename);
      }
    } catch (error) {
      console.warn("Linear API - Failed to upload legacy screenshot (continuing without):", error);
    }
  }
  return result;
};
