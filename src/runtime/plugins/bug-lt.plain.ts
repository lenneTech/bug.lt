import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { createApp } from 'vue'
import { initializeConsoleLogging } from '../utils/consoleLogs'
import { initializeNetworkMonitoring } from '../utils/networkRequests'
import { initializeErrorBoundary } from '../utils/errorBoundary'
import { initializeUserJourneyTracking } from '../utils/userInteractions'
import BugReportButtonPlain from '../components/plain/BugReportButtonPlain.vue'
import type { BugReportConfig, ErrorInfo } from '../types'

// Standalone (no @nuxt/ui) plugin used when the module runs with
// `bug: { ui: false }`. Mirrors plugins/bug-lt.ts but mounts the self-contained
// button and never touches `#ui` / `@nuxt/ui`. See GitHub issue #5.

export default defineNuxtPlugin({
  setup(nuxtApp) {
    // Only run on client side
    if (import.meta.server) return

    const runtimeConfig = useRuntimeConfig()
    const config: BugReportConfig = runtimeConfig.public.bugLt as BugReportConfig

    // Initialize console logging and network monitoring
    if (import.meta.client) {
      initializeConsoleLogging()
      initializeNetworkMonitoring()

      // Initialize user journey tracking
      if (config?.enableUserJourney !== false) {
        initializeUserJourneyTracking(config?.userJourney)
      }

      // Initialize error boundary with optional auto-open
      if (config?.enableErrorBoundary) {
        initializeErrorBoundary((errorInfo: ErrorInfo) => {
          // Auto-open modal if configured
          if (config?.autoOpenOnError) {
            // Dynamic import to avoid circular dependencies
            import('../composables/useBugReport.plain').then(({ useBugReport }) => {
              const { openModal } = useBugReport()
              openModal(errorInfo)
            })
          }
        })

        // Install global Vue error handler
        const originalErrorHandler = nuxtApp.vueApp.config.errorHandler
        nuxtApp.vueApp.config.errorHandler = (err, instance, info) => {
          // Report error through error boundary
          import('../utils/errorBoundary').then(({ reportError }) => {
            const componentName = (instance as any)?.$options?.name || (instance as any)?.$options?.__name || info
            reportError(err instanceof Error ? err : new Error(String(err)), componentName)
          })

          // Call original handler if exists
          if (originalErrorHandler) {
            originalErrorHandler(err, instance, info)
          }
          else {
            console.error('Vue error:', err)
          }
        }
      }
    }

    // Add global component to the app
    nuxtApp.vueApp.component('BugReportButton', BugReportButtonPlain)

    // Mount components on app ready
    nuxtApp.hook('app:mounted', () => {
      const runtimeConfig = useRuntimeConfig()
      const config: BugReportConfig = runtimeConfig.public.bugLt as BugReportConfig

      // Auto-mount bug report button if enabled
      if (config?.autoShow) {
        // Create container for the button
        const buttonContainer = document.createElement('div')
        buttonContainer.id = 'bug-lt-button'
        document.body.appendChild(buttonContainer)

        // Mount button component
        const buttonApp = createApp(BugReportButtonPlain)
        buttonApp.mount(buttonContainer)
      }
    })
  },
})
