import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// The module captures window.fetch at import time, so the fetch mock must be in
// place before the (dynamic) import. Each test imports a fresh module instance.
describe('network request capture', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.resetModules()
    fetchMock = vi.fn().mockResolvedValue(
      new Response('{}', { status: 200, statusText: 'OK' }),
    )
    window.fetch = fetchMock as unknown as typeof fetch
  })

  afterEach(async () => {
    const mod = await import('../../src/runtime/utils/networkRequests')
    mod.resetNetworkMonitoring()
  })

  // Regression for issue #3: fetch(new URL(...)) must record the resolved href,
  // not url: undefined (a URL exposes .href, not .url).
  it('records the href when fetch is called with a URL object', async () => {
    const { initializeNetworkMonitoring, getNetworkRequests } = await import('../../src/runtime/utils/networkRequests')
    initializeNetworkMonitoring()

    await window.fetch(new URL('https://example.com/api/health'))

    const requests = getNetworkRequests()
    expect(requests).toHaveLength(1)
    expect(requests[0]?.url).toBe('https://example.com/api/health')
    expect(requests[0]?.url).toBeDefined()
  })

  it('still records a plain string url', async () => {
    const { initializeNetworkMonitoring, getNetworkRequests } = await import('../../src/runtime/utils/networkRequests')
    initializeNetworkMonitoring()

    await window.fetch('https://example.com/api/data')

    const requests = getNetworkRequests()
    expect(requests).toHaveLength(1)
    expect(requests[0]?.url).toBe('https://example.com/api/data')
  })

  it('records the url and method from a Request object', async () => {
    const { initializeNetworkMonitoring, getNetworkRequests } = await import('../../src/runtime/utils/networkRequests')
    initializeNetworkMonitoring()

    await window.fetch(new Request('https://example.com/api/post', { method: 'POST' }))

    const requests = getNetworkRequests()
    expect(requests).toHaveLength(1)
    expect(requests[0]?.url).toBe('https://example.com/api/post')
    expect(requests[0]?.method).toBe('POST')
  })
})
