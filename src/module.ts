import { addComponent, addImports, addPlugin, addServerHandler, createResolver, defineNuxtModule } from '@nuxt/kit'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

// Module options TypeScript interface definition
export interface ModuleOptions {
  // Module Control
  enabled?: boolean

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

  // Styling
  theme?: 'light' | 'dark' | 'auto'
  customCSS?: string

  // Console Logs
  maxConsoleLogs?: number
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
    autoShow: true,
    position: 'bottom-right',
    buttonColor: '#ef4444',
    enableScreenshot: true,
    enableBrowserInfo: true,
    enableConsoleLogs: true,
    theme: 'auto',
    maxConsoleLogs: 50,
  },
  setup(options, nuxt) {
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

    // Only add runtime config and components if module is enabled
    if (options.enabled !== false) {
      // Add runtime config
      nuxt.options.runtimeConfig.public.bugLt = {
        ...options,
        // Don't expose sensitive data to client
        linearApiKey: undefined,
      }

      // Add server-side runtime config for sensitive data
      nuxt.options.runtimeConfig.bugLt = {
        linearApiKey: options.linearApiKey,
        linearTeamName: options.linearTeamName,
        linearProjectName: options.linearProjectName,
      }

      // Add plugin
      addPlugin(resolver.resolve('./runtime/plugin.client'))

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

      addServerHandler({
        route: '/api/screenshot',
        handler: resolver.resolve('./runtime/server/api/screenshot.post'),
        method: 'post',
      })
    }
  },
})

// Export types for users
export type { ModuleOptions as BugReportOptions }
