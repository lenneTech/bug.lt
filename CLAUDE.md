# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Bug LT** - a comprehensive Nuxt 4 module for bug reporting with Linear integration. The module provides a configurable bug report button that captures screenshots, browser information, console logs, and creates Linear issues with automatic label management.

## Key Architecture

### Module Structure
- **Core Module**: `src/module.ts` - Main Nuxt module definition with configuration options
- **Runtime Components**: Vue components for UI (`BugReportButton`, `BugReportModal`, `BugReportForm`, `UserJourneyTimeline`, `ErrorBoundary`)
- **Composables**: `useBugReport()` - Main state management and API interactions
- **Server API**: H3 handler for bug report submission
- **Linear Integration**: Complete GraphQL client for Linear API with team/project resolution
- **Utilities**: Browser info collection, console log capture, network request tracking, user journey tracking, screenshot generation

### Critical Technical Details

**Screenshot Implementation**: Uses client-side `modern-screenshot` library for DOM-to-PNG capture. No server or Chrome required. Captures current viewport with scroll position via `features.restoreScrollPosition: true`.

**User Journey Tracking**: Captures user interactions (clicks, navigation, form interactions, keyboard events, errors) with element identification and timestamps. Configurable via `userJourney` options.

**Network Request Tracking**: Intercepts Fetch and XHR requests to capture URLs, methods, status codes, and error details. Limited to `maxNetworkRequests` entries.

**Console Log Capture**: Intercepts console methods and cleans CSS styling (`%c` format) for clean output in bug tickets.

**Linear API Integration**: 
- Team/Project resolution by name instead of UUIDs
- Automatic label creation and assignment based on bug report type
- Two-step file upload: get signed URL from Linear, then upload to Google Cloud Storage
- Attachment linking requires creating attachment records after issue creation

**Module Configuration**: Uses `configKey: 'bug'` (not 'bugLt') in Nuxt config. Runtime config separates client/server data - sensitive Linear API keys stay server-side only.

**State Management**: Global composable state with useOverlay for modal management. Modal instance lifecycle requires proper cleanup to avoid null reference errors.

## Common Development Commands

```bash
# Development with auto-reload
npm run dev

# Prepare development environment (required after changes)
npm run dev:prepare

# Build module for distribution
npm run build

# Run tests
npm run test
npm run test:watch

# Type checking (module + playground)
npm run test:types

# Linting
npm run lint

# Release (automated via GitHub Actions)
npm version patch
git push origin --tags
```

## Environment Setup

Required environment variables for full functionality:

```bash
# Linear API (required for bug reporting)
LINEAR_API_KEY=lin_api_...
LINEAR_TEAM_NAME=Entwicklung
LINEAR_PROJECT_NAME=Website  # optional
```

## Key Implementation Patterns

**Error Handling**: Linear API operations are defensive - screenshot/attachment failures don't prevent issue creation. All async operations in composables include proper error boundaries.

**Type Safety**: Strict TypeScript with comprehensive interfaces for all data structures (BugReportData, LinearIssueData, BrowserInfo, etc.).

**Internationalization**: All UI text is in German as requested for German-only customer base.

**Label Management**: Automatic label creation with color-coded mapping:
- `bug` → red (#f87171)
- `feature` → blue (#60a5fa) 
- `enhancement` → green (#34d399)
- `other` → purple (#a78bfa)

## Testing Linear Integration

When working with Linear API:
1. Use team names like "Entwicklung" instead of UUIDs
2. File uploads require exact headers from Linear's fileUpload response
3. Attachment creation must happen AFTER issue creation with the assetUrl
4. Label operations need teamId parameter for scope

## Release Process

Automated via GitHub Actions on git tags. Release workflow:
1. `npm version patch/minor/major`
2. `git push origin --tags` 
3. CI runs tests, builds, publishes to NPM, creates GitHub release

Requires `NPM_TOKEN` secret in GitHub repository settings.

## Module Dependencies

- **@nuxt/ui**: All UI components (UButton, UModal, UForm, etc.)
- **modern-screenshot**: Client-side DOM-to-PNG screenshot capture
- **h3**: Server API endpoints
- **@nuxt/kit**: Module development utilities

## Common Issues

**Screenshots not capturing scroll position**: Ensure `features.restoreScrollPosition: true` is set in screenshot options
**Screenshot blank or missing elements**: Some external images may fail due to CORS - the library uses placeholders for failed images
**Modal won't close**: Ensure modal instance cleanup in composable
**Linear API 400**: Usually missing headers in file upload or incorrect GraphQL schema
**Labels not created**: Verify team resolution and API permissions
**Console logs have CSS artifacts**: The consoleLogs utility cleans `%c` styles, but complex logging may need review