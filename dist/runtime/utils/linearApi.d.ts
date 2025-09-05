import type { BugReportData, LinearIssueData } from '../types/index.js';
export interface LinearIssueResponse {
    success: boolean;
    issueId?: string;
    issueUrl?: string;
    error?: string;
}
export declare class LinearApiClient {
    private apiKey;
    private baseUrl;
    constructor(apiKey: string);
    private graphqlRequest;
    getTeams(): Promise<{
        id: string;
        name: string;
        key: string;
    }[]>;
    getProjects(): Promise<{
        id: string;
        name: string;
    }[]>;
    getLabels(teamId: string): Promise<{
        id: string;
        name: string;
    }[]>;
    createIssue(issueData: LinearIssueData): Promise<LinearIssueResponse>;
    createLabel(teamId: string, name: string, color: string): Promise<{
        success: boolean;
        labelId?: string;
        error?: string;
    }>;
    createAttachment(issueId: string, url: string, filename: string): Promise<{
        success: boolean;
        attachmentId?: string;
        error?: string;
    }>;
    uploadAttachment(file: Blob, filename: string): Promise<{
        success: boolean;
        attachmentId?: string;
        error?: string;
    }>;
    uploadAttachmentWithSize(file: Blob, filename: string, size: number, contentType: string): Promise<{
        success: boolean;
        attachmentId?: string;
        error?: string;
    }>;
}
export declare const formatBugReportForLinear: (bugReport: BugReportData) => Partial<LinearIssueData>;
export declare const createLinearIssueFromBugReport: (bugReport: BugReportData, config: {
    apiKey: string;
    teamName?: string;
    projectName?: string;
}) => Promise<LinearIssueResponse>;
