import {
  addComponent,
  addImports,
  addPlugin,
  addServerHandler,
  createResolver,
  defineNuxtModule,
  installModule,
} from '@nuxt/kit'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

// Module options TypeScript interface definition
export interface ModuleOptions {
  // Module Control
  enabled?: boolean

  /**
   * Enable or disable `@nuxt/ui` module
   * @defaultValue `true`
   * @link https://ui.nuxt.com/docs/getting-started/installation/nuxt
   */
  ui?: boolean

  /**
   * Server route the bug report is submitted to (server handler + client `$fetch`).
   *
   * Defaults to a non-`/api` path on purpose: consuming apps very commonly proxy
   * every `/api/...` request to a separate backend (via Nitro `routeRules`). Such a
   * catch-all would swallow `/api/bug-report` and forward it to the backend (404),
   * so this module's own handler would never run. Keep the default outside `/api`
   * (Nuxt-internal `_`-prefix style) unless you have a dedicated rule for it.
   * @defaultValue `'/_bug-lt/report'`
   */
  endpoint?: string

  // Linear Integration
  linearApiKey?: string
  linearTeamName?: string
  linearProjectName?: string

  // Button Configuration
  autoShow?: boolean
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  buttonColor?: string
  buttonText?: string
  buttonIcon?: string

  // Feature Toggles
  enableScreenshot?: boolean
  enableBrowserInfo?: boolean
  enableConsoleLogs?: boolean
  enableNetworkRequests?: boolean
  enableErrorBoundary?: boolean
  enableUserJourney?: boolean
  autoOpenOnError?: boolean

  // Styling
  theme?: 'light' | 'dark' | 'auto'

  // Console Logs
  maxConsoleLogs?: number

  // Network Requests
  maxNetworkRequests?: number

  // User Journey Tracking
  userJourney?: {
    enabled?: boolean
    maxEvents?: number
    captureClicks?: boolean
    captureNavigation?: boolean
    captureFormInteractions?: boolean
    captureHover?: boolean
    captureScroll?: boolean
    captureInputChanges?: boolean
    captureInputValues?: boolean
    captureKeyboard?: boolean
    captureErrors?: boolean
    captureModalEvents?: boolean
    throttleRate?: number
  }

}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@lenne.tech/bug.lt',
    configKey: 'bug',
    compatibility: {
      nuxt: '>=4.0.0',
    },
  },
  // Default configuration options of the Nuxt module
  defaults: {
    enabled: true,
    ui: true,
    // Off `/api/` so consumer `/api/**` proxies (Nitro routeRules) don't swallow it
    endpoint: '/_bug-lt/report',
    autoShow: true,
    position: 'bottom-right',
    buttonColor: '#ef4444',
    enableScreenshot: true,
    enableBrowserInfo: true,
    enableConsoleLogs: true,
    enableNetworkRequests: true,
    enableErrorBoundary: true,
    enableUserJourney: true,
    autoOpenOnError: false,
    theme: 'auto',
    maxConsoleLogs: 50,
    maxNetworkRequests: 50,
    userJourney: {
      enabled: true,
      maxEvents: 50,
      captureClicks: true,
      captureNavigation: true,
      captureFormInteractions: true,
      captureHover: false,
      captureScroll: false,
      captureInputChanges: false,
      captureInputValues: false,
      captureKeyboard: true,
      captureErrors: true,
      captureModalEvents: true,
      throttleRate: 100,
    },
  },
  async setup(options, nuxt) {
    // Early exit if module is disabled
    if (options.enabled === false) {
      console.info('[@lenne.tech/bug.lt] Module is disabled - skipping initialization')
      return
    }

    const resolver = createResolver(import.meta.url)

    // Copy assets to public directory (only in non-test environments)
    if (nuxt.options.srcDir) {
      const publicDir = join(nuxt.options.srcDir, 'public', 'assets')
      if (!existsSync(publicDir)) {
        mkdirSync(publicDir, { recursive: true })
      }
    }

    // Install @nuxt/ui as dependency (if enabled)
    if (options.ui) {
      await installModule('@nuxt/ui')
    }
    // Add runtime config
    nuxt.options.runtimeConfig.public.bugLt = {
      enabled: options.enabled,
      ui: options.ui,
      endpoint: options.endpoint,
      autoShow: options.autoShow,
      position: options.position,
      buttonColor: options.buttonColor,
      buttonText: options.buttonText,
      buttonIcon: options.buttonIcon,
      enableScreenshot: options.enableScreenshot,
      enableBrowserInfo: options.enableBrowserInfo,
      enableConsoleLogs: options.enableConsoleLogs,
      enableNetworkRequests: options.enableNetworkRequests,
      enableErrorBoundary: options.enableErrorBoundary,
      enableUserJourney: options.enableUserJourney,
      autoOpenOnError: options.autoOpenOnError,
      theme: options.theme,
      maxConsoleLogs: options.maxConsoleLogs,
      maxNetworkRequests: options.maxNetworkRequests,
      userJourney: options.userJourney,
      // Don't expose sensitive data to client: linearApiKey, linearTeamName, linearProjectName
    }

    // Add server-side runtime config for sensitive data
    nuxt.options.runtimeConfig.bugLt = {
      linearApiKey: options.linearApiKey,
      linearTeamName: options.linearTeamName,
      linearProjectName: options.linearProjectName,
    }

    // Two fully separate runtime variants:
    // - `ui: true`  -> @nuxt/ui based components/composable/plugin (default).
    // - `ui: false` -> self-contained variants with their own modal + toast and
    //   NO `#ui` / `@nuxt/ui` import at all, so the module works in any Nuxt
    //   project regardless of the styling stack (e.g. Tailwind v3). See issue #5.
    const useUi = !!options.ui

    // Add plugin
    addPlugin({
      src: resolver.resolve(useUi ? './runtime/plugins/bug-lt' : './runtime/plugins/bug-lt.plain'),
      mode: 'client',
    })

    // Add components (registered under the same public names in both modes)
    addComponent({
      name: 'BugReportButton',
      filePath: resolver.resolve(useUi
        ? './runtime/components/BugReportButton.vue'
        : './runtime/components/plain/BugReportButtonPlain.vue'),
    })

    addComponent({
      name: 'BugReportModal',
      filePath: resolver.resolve(useUi
        ? './runtime/components/BugReportModal.vue'
        : './runtime/components/plain/BugReportModalPlain.vue'),
    })

    addComponent({
      name: 'BugIcon',
      filePath: resolver.resolve('./runtime/components/BugIcon.vue'),
    })

    addComponent({
      name: 'ErrorBoundary',
      filePath: resolver.resolve('./runtime/components/ErrorBoundary.vue'),
    })

    addComponent({
      name: 'UserJourneyTimeline',
      filePath: resolver.resolve(useUi
        ? './runtime/components/UserJourneyTimeline.vue'
        : './runtime/components/plain/UserJourneyTimelinePlain.vue'),
    })

    // Add composables
    addImports({
      name: 'useBugReport',
      from: resolver.resolve(useUi
        ? './runtime/composables/useBugReport'
        : './runtime/composables/useBugReport.plain'),
    })

    // Add server API endpoint.
    // Route comes from `options.endpoint` (default `/_bug-lt/report`) so it sits
    // outside `/api/**` and isn't swallowed by consumer `/api/**` proxies.
    addServerHandler({
      route: options.endpoint,
      handler: resolver.resolve('./runtime/server/api/bug-report.post'),
      method: 'post',
    })
  },
})

// Export types for users
export type { ModuleOptions as BugReportOptions }
