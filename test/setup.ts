import { vi } from 'vitest'

// Mock global functions that are available in Nuxt runtime but not in test environment
global.defineNuxtConfig = vi.fn().mockImplementation(config => config)
global.useRuntimeConfig = vi.fn()
global.$fetch = vi.fn()

// Mock Nuxt UI composables
vi.mock('#ui/composables/useOverlay', () => ({
  useOverlay: vi.fn().mockReturnValue({
    create: vi.fn().mockReturnValue({
      open: vi.fn(),
      close: vi.fn(),
    }),
  }),
}))

// Mock H3 utilities
vi.mock('h3', async () => {
  const actual = await vi.importActual('h3')
  return {
    ...actual,
    defineEventHandler: vi.fn().mockImplementation(handler => handler),
    readBody: vi.fn(),
    createError: vi.fn().mockImplementation(({ statusCode, statusMessage }) => {
      const error = new Error(statusMessage)
      ;(error as any).statusCode = statusCode
      return error
    }),
  }
})

// Setup DOM globals for browser info tests
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (Test Browser)',
    language: 'en-US',
    languages: ['en-US', 'en'],
    platform: 'Test',
    cookieEnabled: true,
    onLine: true,
    vendor: 'Test Vendor',
  },
  writable: true,
})

Object.defineProperty(window, 'location', {
  value: {
    href: 'https://test.com',
  },
  writable: true,
})

Object.defineProperty(window, 'document', {
  value: {
    referrer: '',
    title: 'Test Document',
  },
  writable: true,
})

Object.defineProperty(window, 'screen', {
  value: {
    width: 1920,
    height: 1080,
    colorDepth: 24,
    pixelDepth: 24,
  },
  writable: true,
})

// Mock console methods for console capture tests
const originalConsole = { ...console }

beforeEach(() => {
  vi.clearAllMocks()
  // Restore original console before each test
  Object.assign(console, originalConsole)
})

// Make original console available for tests
;(global as any).originalConsole = originalConsole
