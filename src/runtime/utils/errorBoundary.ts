import type { ErrorInfo } from '../types'

// Global storage for last error
let lastCapturedError: ErrorInfo | null = null
let errorCallbacks: Array<(error: ErrorInfo) => void> = []

let isInitialized = false

// Helper to create ErrorInfo from Error object
const createErrorInfo = (
  error: Error | string,
  componentName?: string,
): ErrorInfo => {
  const message = typeof error === 'string' ? error : error.message
  const stack = typeof error === 'string' ? undefined : error.stack

  return {
    message,
    stack,
    componentName,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
  }
}

// Initialize error boundary monitoring
export const initializeErrorBoundary = (
  onError?: (error: ErrorInfo) => void,
): void => {
  if (isInitialized || typeof window === 'undefined') return

  isInitialized = true

  if (onError) {
    errorCallbacks.push(onError)
  }

  // Capture unhandled errors
  window.addEventListener('error', (event) => {
    const errorInfo = createErrorInfo(
      event.error || event.message,
      undefined,
    )

    lastCapturedError = errorInfo

    // Call all registered callbacks
    errorCallbacks.forEach(callback => callback(errorInfo))
  })

  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const errorInfo = createErrorInfo(
      event.reason instanceof Error ? event.reason : String(event.reason),
      undefined,
    )

    lastCapturedError = errorInfo

    // Call all registered callbacks
    errorCallbacks.forEach(callback => callback(errorInfo))
  })
}

// Register a callback to be called when an error occurs
export const onErrorCaptured = (callback: (error: ErrorInfo) => void): void => {
  errorCallbacks.push(callback)
}

// Get the last captured error
export const getLastError = (): ErrorInfo | null => {
  return lastCapturedError ? { ...lastCapturedError } : null
}

// Clear the last captured error
export const clearLastError = (): void => {
  lastCapturedError = null
}

// Manually report an error (for use in try-catch blocks)
export const reportError = (
  error: Error | string,
  componentName?: string,
): void => {
  const errorInfo = createErrorInfo(error, componentName)
  lastCapturedError = errorInfo

  // Call all registered callbacks
  errorCallbacks.forEach(callback => callback(errorInfo))
}

// Reset error boundary (for testing)
export const resetErrorBoundary = (): void => {
  clearLastError()
  errorCallbacks = []
  isInitialized = false
}

// Vue error handler helper
export const createVueErrorHandler = (
  originalHandler?: (err: unknown, instance: unknown, info: string) => void,
) => {
  return (err: unknown, instance: unknown, info: string) => {
    // Extract component name if available
    const componentName = (instance as any)?.$options?.name || (instance as any)?.$options?.__name

    // Report the error
    if (err instanceof Error) {
      reportError(err, componentName || info)
    }
    else {
      reportError(String(err), componentName || info)
    }

    // Call original handler if it exists
    if (originalHandler) {
      originalHandler(err, instance, info)
    }
  }
}
