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

    // Add plugin
    addPlugin({
      src: resolver.resolve('./runtime/plugins/bug-lt'),
      mode: 'client',
    })

    // Add components
    addComponent({
      name: 'BugReportButton',
      filePath: resolver.resolve('./runtime/components/BugReportButton.vue'),
    })

    addComponent({
      name: 'BugReportModal',
      filePath: resolver.resolve('./runtime/components/BugReportModal.vue'),
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
      filePath: resolver.resolve('./runtime/components/UserJourneyTimeline.vue'),
    })

    // Add composables
    addImports({
      name: 'useBugReport',
      from: resolver.resolve('./runtime/composables/useBugReport'),
    })

    // Add server API endpoints
    addServerHandler({
      route: '/api/bug-report',
      handler: resolver.resolve('./runtime/server/api/bug-report.post'),
      method: 'post',
    })
  },
})

// Export types for users
export type { ModuleOptions as BugReportOptions }
