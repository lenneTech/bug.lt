import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { createApp } from 'vue'
import { initializeConsoleLogging } from '../utils/consoleLogs'
import BugReportButton from '../components/BugReportButton.vue'
import BugReportModal from '../components/BugReportModal.vue'
import type { BugReportConfig } from '~/src/runtime/types'

export default defineNuxtPlugin({
  setup(nuxtApp) {
    // Only run on client side
    if (import.meta.server) return

    // Initialize console logging
    if (import.meta.client) {
      initializeConsoleLogging()
    }

    // Add global components to the app
    nuxtApp.vueApp.component('BugReportButton', BugReportButton)
    nuxtApp.vueApp.component('BugReportModal', BugReportModal)

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
        const buttonApp = createApp(BugReportButton)
        buttonApp.mount(buttonContainer)
      }
    })
  },
})
