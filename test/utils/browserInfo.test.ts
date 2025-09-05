import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getBrowserInfo } from '../../src/runtime/utils/browserInfo'

// Mock the window object globally
const mockWindow = {
  navigator: {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    language: 'de-DE',
    languages: ['de-DE', 'de', 'en-US', 'en'],
    platform: 'MacIntel',
    cookieEnabled: true,
    onLine: true,
    vendor: 'Google Inc.',
  },
  location: {
    href: 'https://example.com/test?param=1',
  },
  document: {
    referrer: 'https://google.com',
    title: 'Test Page Title',
  },
  screen: {
    width: 1920,
    height: 1080,
    colorDepth: 24,
    pixelDepth: 24,
  },
  innerWidth: 1200,
  innerHeight: 800,
  performance: {
    timing: {
      navigationStart: 1000,
      domContentLoadedEventEnd: 1500,
      loadEventEnd: 2000,
      responseEnd: 1200,
      domComplete: 1800,
    },
    getEntriesByType: vi.fn().mockReturnValue([
      { name: 'first-paint', startTime: 1300 },
      { name: 'first-contentful-paint', startTime: 1400 },
    ]),
    getEntriesByName: vi.fn().mockImplementation((name: string) => {
      if (name === 'first-paint') return [{ startTime: 1300 }]
      if (name === 'first-contentful-paint') return [{ startTime: 1400 }]
      return []
    }),
  },
}

describe('getBrowserInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock Date.now and Intl.DateTimeFormat
    vi.spyOn(Date, 'now').mockReturnValue(1704067200000)
    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2024-01-01T00:00:00.000Z')
    vi.spyOn(Intl, 'DateTimeFormat').mockReturnValue({
      resolvedOptions: () => ({ timeZone: 'Europe/Berlin' }),
    } as any)

    // Mock window globally
    global.window = mockWindow as any
  })

  it('should collect browser information when window is available', () => {
    const result = getBrowserInfo()

    expect(result.userAgent).toBe(mockWindow.navigator.userAgent)
    expect(result.language).toBe('de-DE')
    expect(result.platform).toBe('MacIntel')
    expect(result.url).toBe('https://example.com/test?param=1')
    expect(result.viewport.width).toBe(1200)
    expect(result.viewport.height).toBe(800)
  })

  it('should throw error when window is undefined', () => {
    global.window = undefined as any

    expect(() => getBrowserInfo()).toThrow('Browser info collection is only available in the browser')
  })

  it('should handle missing performance data', () => {
    const windowWithoutPerformance = {
      ...mockWindow,
      performance: undefined,
    }
    global.window = windowWithoutPerformance as any

    const result = getBrowserInfo()

    expect(result.userAgent).toBeDefined()
    expect(result.performance).toBeUndefined()
  })
})
