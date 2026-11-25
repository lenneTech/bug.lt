---
title: bug.lt
description: A Nuxt 4 module that lets testers and users report bugs from the app, with screenshot and context, as Linear issues.
navigation:
  title: Overview
---

`@lenne.tech/bug.lt` adds a bug report button to a Nuxt 4 app. A click takes a screenshot and opens a form for title,
type, description and steps. The report goes to the app's own server, which creates a Linear issue with the
screenshot and the context the module collected: console output, network requests, the user's last actions and
browser details. The Linear API key stays on the server.

- Screenshots in the browser with `modern-screenshot`, no Chrome or Puppeteer on the server
- User journey: clicks, navigation, form interactions, keyboard and errors
- Network requests with status and error details
- Labels per report type, created in Linear when they are missing
- Two UI modes: with `@nuxt/ui`, or self-contained for any Nuxt project
- German user interface

Angular apps get the same reporter from `@lenne.tech/ng-base/bug`, see the ng-base docs.

## Pages

| Page | What it covers |
|---|---|
| [Getting started](./1.getting-started.md) | Installation, `nuxt.config.ts` and the Linear credentials |
| [Configuration](./2.configuration.md) | Every option, the endpoint, the user journey options |
| [Linear](./3.linear.md) | API key, team and project, labels, deployed stages |
| [Usage](./4.usage.md) | The button, `useBugReport()`, components, the UI modes |
| [What is captured](./5.what-is-captured.md) | Screenshot, user journey, network requests, console, browser details, and what is filtered |

## Requirements

- Nuxt 4.0 or newer
- A Linear API key with write access
