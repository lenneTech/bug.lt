import { describe, expect, it, vi } from 'vitest'
import { addComponent, addImports, addPlugin, addServerHandler, createResolver } from '@nuxt/kit'
import module, { type ModuleOptions } from '../src/module'

// Mock @nuxt/kit
vi.mock('@nuxt/kit', () => ({
  defineNuxtModule: vi.fn().mockImplementation(config => config),
  addComponent: vi.fn(),
  addImports: vi.fn(),
  addPlugin: vi.fn(),
  addServerHandler: vi.fn(),
  createResolver: vi.fn().mockImplementation(() => ({
    resolve: vi.fn().mockImplementation(path => path),
  })),
  installModule: vi.fn(),
}))

describe('Bug LT Module', () => {
  it('should have correct meta configuration', () => {
    expect(module.meta).toEqual({
      name: '@lenne.tech/bug.lt',
      configKey: 'bug',
      compatibility: {
        nuxt: '>=4.0.0',
      },
    })
  })

  it('should have correct default options', () => {
    expect(module.defaults).toEqual({
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
        captureHover: true,
        captureScroll: true,
        captureInputChanges: true,
        captureInputValues: false,
        captureKeyboard: true,
        captureErrors: true,
        captureModalEvents: true,
        throttleRate: 100,
      },
    })
  })

  it('should register components correctly', async () => {
    const mockNuxt = {
      options: {
        runtimeConfig: {
          public: { bugLt: {} },
          bugLt: {},
        },
        modules: [],
      },
    }

    const mockOptions: ModuleOptions = {
      linearApiKey: 'test-key',
      linearTeamName: 'Test Team',
      autoShow: true,
    }

    await module.setup(mockOptions, mockNuxt)

    expect(addComponent).toHaveBeenCalledWith({
      name: 'BugReportButton',
      filePath: './runtime/components/BugReportButton.vue',
    })

    expect(addComponent).toHaveBeenCalledWith({
      name: 'BugReportModal',
      filePath: './runtime/components/BugReportModal.vue',
    })
  })

  it('should register composables correctly', async () => {
    const mockNuxt = {
      options: {
        runtimeConfig: {
          public: { bugLt: {} },
          bugLt: {},
        },
        modules: [],
      },
    }

    const mockOptions: ModuleOptions = {}

    await module.setup(mockOptions, mockNuxt)

    expect(addImports).toHaveBeenCalledWith({
      name: 'useBugReport',
      from: './runtime/composables/useBugReport',
    })
  })

  it('should register server handlers correctly', async () => {
    const mockNuxt = {
      options: {
        runtimeConfig: {
          public: { bugLt: {} },
          bugLt: {},
        },
        modules: [],
      },
    }

    const mockOptions: ModuleOptions = {}

    await module.setup(mockOptions, mockNuxt)

    expect(addServerHandler).toHaveBeenCalledWith({
      route: '/api/bug-report',
      handler: './runtime/server/api/bug-report.post',
      method: 'post',
    })
  })

  it('should register plugin correctly', async () => {
    const mockNuxt = {
      options: {
        runtimeConfig: {
          public: { bugLt: {} },
          bugLt: {},
        },
        modules: [],
      },
    }

    const mockOptions: ModuleOptions = {}

    await module.setup(mockOptions, mockNuxt)

    expect(addPlugin).toHaveBeenCalledWith({
      src: './runtime/plugins/bug-lt',
      mode: 'client',
    })
  })

  it('should configure runtime config correctly', async () => {
    const mockNuxt = {
      options: {
        runtimeConfig: {
          public: { bugLt: {} },
          bugLt: {},
        },
        modules: [],
      },
    }

    const mockOptions: ModuleOptions = {
      linearApiKey: 'test-api-key',
      linearTeamName: 'Test Team',
      linearProjectName: 'Test Project',
      autoShow: true,
      position: 'top-left',
      buttonColor: '#ff0000',
    }

    await module.setup(mockOptions, mockNuxt)

    // Public config should not expose sensitive data
    expect(mockNuxt.options.runtimeConfig.public.bugLt).toEqual({
      ...mockOptions,
      linearApiKey: undefined, // Should be undefined in public config
      linearProjectName: undefined, // Should be undefined in public config
      linearTeamName: undefined, // Should be undefined in public config
    })

    // Server config should contain sensitive data
    expect(mockNuxt.options.runtimeConfig.bugLt).toEqual({
      linearApiKey: 'test-api-key',
      linearTeamName: 'Test Team',
      linearProjectName: 'Test Project',
    })
  })

  it('should handle missing linear configuration', async () => {
    const mockNuxt = {
      options: {
        runtimeConfig: {
          public: { bugLt: {} },
          bugLt: {},
        },
        modules: [],
      },
    }

    const mockOptions: ModuleOptions = {
      autoShow: false,
      position: 'bottom-left',
    }

    await module.setup(mockOptions, mockNuxt)

    expect(mockNuxt.options.runtimeConfig.bugLt).toEqual({
      linearApiKey: undefined,
      linearTeamName: undefined,
      linearProjectName: undefined,
    })
  })

  it('should use createResolver to resolve file paths', async () => {
    const mockNuxt = {
      options: {
        runtimeConfig: {
          public: { bugLt: {} },
          bugLt: {},
        },
        modules: [],
      },
    }

    const mockOptions: ModuleOptions = {}

    await module.setup(mockOptions, mockNuxt)

    expect(createResolver).toHaveBeenCalledWith(expect.any(String))
  })

  it('should export type definitions', () => {
    // Test that ModuleOptions interface is properly typed
    const options: ModuleOptions = {
      linearApiKey: 'string',
      linearTeamName: 'string',
      linearProjectName: 'string',
      autoShow: true,
      position: 'bottom-right',
      buttonColor: 'string',
      buttonText: 'string',
      buttonIcon: 'string',
      enableScreenshot: true,
      enableBrowserInfo: true,
      enableConsoleLogs: true,
      theme: 'auto',
      maxConsoleLogs: 100,
    }

    expect(options).toBeDefined()
  })

  it('should validate position type constraints', () => {
    const validPositions: ModuleOptions['position'][] = [
      'bottom-right',
      'bottom-left',
      'top-right',
      'top-left',
    ]

    validPositions.forEach((position) => {
      const options: ModuleOptions = { position }
      expect(options.position).toBe(position)
    })
  })

  it('should validate theme type constraints', () => {
    const validThemes: ModuleOptions['theme'][] = ['light', 'dark', 'auto']

    validThemes.forEach((theme) => {
      const options: ModuleOptions = { theme }
      expect(options.theme).toBe(theme)
    })
  })
})
