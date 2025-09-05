import { createError, defineEventHandler, readBody } from "h3";
import { createLinearIssueFromBugReport } from "../../utils/linearApi.js";
export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const config = runtimeConfig.bugLt;
  if (!config.linearApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Linear API is not configured. Please set linearApiKey."
    });
  }
  try {
    const bugReportData = await readBody(event);
    if (!bugReportData.title || !bugReportData.type || !bugReportData.description) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing required fields: title, type, and description are required"
      });
    }
    const result = await createLinearIssueFromBugReport(bugReportData, {
      apiKey: config.linearApiKey,
      teamName: config.linearTeamName,
      projectName: config.linearProjectName
    });
    if (!result.success) {
      throw createError({
        statusCode: 500,
        statusMessage: result.error || "Failed to create Linear issue"
      });
    }
    return {
      success: true,
      issueId: result.issueId,
      issueUrl: result.issueUrl,
      message: "Bug report submitted successfully"
    };
  } catch (error) {
    if (error?.statusCode) {
      throw error;
    }
    console.error("Bug report submission error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error while processing bug report"
    });
  }
});
