import type { NetworkRequestEntry } from '../types'

// Global storage for network requests
const networkRequestHistory: NetworkRequestEntry[] = []
const maxHistorySize = 100

// Sensitive headers to filter out
const sensitiveHeaders = ['authorization', 'cookie', 'set-cookie', 'x-api-key', 'api-key', 'token']

let isInitialized = false

// Original fetch and XMLHttpRequest
const originalFetch = window.fetch
const originalXHROpen = XMLHttpRequest.prototype.open
const originalXHRSend = XMLHttpRequest.prototype.send

// Helper to check if URL should be captured
const shouldCaptureUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url, window.location.origin)
    const pathname = urlObj.pathname.toLowerCase()

    // Skip static assets
    const staticExtensions = ['.css', '.js', '.map', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot']
    if (staticExtensions.some(ext => pathname.endsWith(ext))) {
      return false
    }

    return true
  }
  catch {
    return true
  }
}

// Helper to filter sensitive headers
const filterHeaders = (headers: Record<string, string>): Record<string, string> => {
  const filtered: Record<string, string> = {}

  for (const [key, value] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase()
    if (!sensitiveHeaders.includes(lowerKey)) {
      filtered[key] = value
    }
    else {
      filtered[key] = '[FILTERED]'
    }
  }

  return filtered
}

// Helper to truncate body
const truncateBody = (body: string | null, maxLength = 1000): string | undefined => {
  if (!body) return undefined
  if (body.length <= maxLength) return body
  return `${body.substring(0, maxLength)}... [truncated ${body.length - maxLength} characters]`
}

// Helper to extract headers from Headers object
const extractHeaders = (headers: Headers): Record<string, string> => {
  const result: Record<string, string> = {}
  headers.forEach((value, key) => {
    result[key] = value
  })
  return filterHeaders(result)
}

// Add request to history
const addToHistory = (entry: NetworkRequestEntry): void => {
  networkRequestHistory.push(entry)

  // Keep history size manageable
  if (networkRequestHistory.length > maxHistorySize) {
    networkRequestHistory.shift()
  }
}

// Initialize network request monitoring
export const initializeNetworkMonitoring = (): void => {
  if (isInitialized || typeof window === 'undefined') return

  isInitialized = true

  // Intercept fetch
  window.fetch = async (...args: Parameters<typeof fetch>): Promise<Response> => {
    const startTime = Date.now()
    const url = typeof args[0] === 'string' ? args[0] : args[0].url
    const options = typeof args[0] === 'string' ? args[1] : args[0]

    if (!shouldCaptureUrl(url)) {
      return originalFetch(...args)
    }

    const method = options?.method || 'GET'
    const requestHeaders = options?.headers ? extractHeaders(new Headers(options.headers)) : {}
    let requestBody: string | undefined

    if (options?.body) {
      if (typeof options.body === 'string') {
        requestBody = truncateBody(options.body)
      }
      else {
        try {
          requestBody = truncateBody(JSON.stringify(options.body))
        }
        catch {
          requestBody = '[Unable to serialize body]'
        }
      }
    }

    try {
      const response = await originalFetch(...args)
      const duration = Date.now() - startTime

      // Clone response to read body without consuming it
      const clonedResponse = response.clone()
      let responseBody: string | undefined

      try {
        const text = await clonedResponse.text()
        responseBody = truncateBody(text)
      }
      catch {
        responseBody = '[Unable to read response body]'
      }

      const entry: NetworkRequestEntry = {
        method,
        url,
        status: response.status,
        statusText: response.statusText,
        timestamp: new Date().toISOString(),
        duration,
        requestHeaders,
        responseHeaders: extractHeaders(response.headers),
        requestBody,
        responseBody,
        type: 'fetch',
      }

      addToHistory(entry)

      return response
    }
    catch (error) {
      const duration = Date.now() - startTime

      const entry: NetworkRequestEntry = {
        method,
        url,
        status: 0,
        statusText: 'Network Error',
        timestamp: new Date().toISOString(),
        duration,
        requestHeaders,
        requestBody,
        error: error instanceof Error ? error.message : String(error),
        type: 'fetch',
      }

      addToHistory(entry)

      throw error
    }
  }

  // Intercept XMLHttpRequest
  XMLHttpRequest.prototype.open = function (method: string, url: string | URL, ...rest: any[]): void {
    const urlString = typeof url === 'string' ? url : url.toString()

    // Store request info on the XHR object
    ;(this as any)._bugLtRequestInfo = {
      method,
      url: urlString,
      startTime: Date.now(),
      shouldCapture: shouldCaptureUrl(urlString),
    }

    return originalXHROpen.call(this, method, url, ...rest)
  }

  XMLHttpRequest.prototype.send = function (body?: Document | XMLHttpRequestBodyInit | null): void {
    const requestInfo = (this as any)._bugLtRequestInfo

    if (!requestInfo || !requestInfo.shouldCapture) {
      return originalXHRSend.call(this, body)
    }

    // Capture request headers
    const requestHeaders: Record<string, string> = {}

    // Store request body
    let requestBody: string | undefined
    if (body) {
      if (typeof body === 'string') {
        requestBody = truncateBody(body)
      }
      else {
        try {
          requestBody = truncateBody(JSON.stringify(body))
        }
        catch {
          requestBody = '[Unable to serialize body]'
        }
      }
    }

    // Listen for completion
    this.addEventListener('loadend', () => {
      const duration = Date.now() - requestInfo.startTime

      // Extract response headers
      const responseHeaders: Record<string, string> = {}
      const headerString = this.getAllResponseHeaders()
      if (headerString) {
        headerString.split('\r\n').forEach((line) => {
          const parts = line.split(': ')
          if (parts.length === 2) {
            responseHeaders[parts[0]] = parts[1]
          }
        })
      }

      const entry: NetworkRequestEntry = {
        method: requestInfo.method,
        url: requestInfo.url,
        status: this.status,
        statusText: this.statusText,
        timestamp: new Date().toISOString(),
        duration,
        requestHeaders: filterHeaders(requestHeaders),
        responseHeaders: filterHeaders(responseHeaders),
        requestBody,
        responseBody: truncateBody(this.responseText),
        type: 'xhr',
      }

      // Add error if request failed
      if (this.status === 0 && this.statusText === '') {
        entry.error = 'Network Error'
      }

      addToHistory(entry)
    })

    return originalXHRSend.call(this, body)
  }
}

// Get recent network requests
export const getNetworkRequests = (limit = 50): NetworkRequestEntry[] => {
  return networkRequestHistory
    .slice(-limit)
    .map(req => ({ ...req })) // Return copies to prevent mutation
}

// Clear network request history (for testing)
export const clearNetworkRequests = (): void => {
  networkRequestHistory.length = 0
}

// Reset network monitoring (for testing)
export const resetNetworkMonitoring = (): void => {
  clearNetworkRequests()
  isInitialized = false

  // Restore original methods
  if (typeof window !== 'undefined') {
    window.fetch = originalFetch
    XMLHttpRequest.prototype.open = originalXHROpen
    XMLHttpRequest.prototype.send = originalXHRSend
  }
}
