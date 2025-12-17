import type { ConsoleLogEntry } from '../types'

// Global storage for console logs
const consoleLogHistory: ConsoleLogEntry[] = []
const maxHistorySize = 1000

/**
 * Remove CSS styling from console log messages
 * Handles %c format specifiers and their corresponding CSS style arguments
 */
function cleanConsoleMessage(arg: unknown): string {
  if (typeof arg !== 'string') {
    if (arg instanceof Error) {
      return arg.message
    }
    try {
      const stringified = JSON.stringify(arg, null, 2)
      // JSON.stringify returns undefined for undefined, functions, and symbols
      return stringified ?? String(arg)
    }
    catch {
      return String(arg)
    }
  }

  // Remove %c placeholders from the message
  let cleaned: string = arg.replace(/%c/g, '')

  // Clean up extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim()

  return cleaned
}

/**
 * Check if a string looks like a CSS style (used with %c)
 */
function isCssStyleString(arg: unknown): boolean {
  if (typeof arg !== 'string') {
    return false
  }

  // CSS style strings typically contain these properties
  const cssPatterns: RegExp[] = [
    /background\s*:/i,
    /color\s*:/i,
    /font-weight\s*:/i,
    /padding\s*:/i,
    /border-radius\s*:/i,
    /font-size\s*:/i,
    /margin\s*:/i,
    /text-decoration\s*:/i,
  ]

  return cssPatterns.some(pattern => pattern.test(arg))
}

// Original console methods
const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
  debug: console.debug,
}

let isInitialized = false

// Initialize console log intercepting
export const initializeConsoleLogging = (): void => {
  if (isInitialized || typeof window === 'undefined') return

  isInitialized = true

  const createLogEntry = (level: ConsoleLogEntry['level'], args: any[]): ConsoleLogEntry => {
    // Filter out CSS style strings and clean messages
    const messages: string[] = args
      .filter(arg => !isCssStyleString(arg))
      .map(arg => cleanConsoleMessage(arg))
      .filter(msg => msg.length > 0)

    const entry: ConsoleLogEntry = {
      level,
      message: messages,
      timestamp: new Date().toISOString(),
    }

    // Add stack trace for errors
    if (level === 'error' && args.some(arg => arg instanceof Error)) {
      const error = args.find(arg => arg instanceof Error) as Error
      entry.stack = error.stack
    }

    return entry
  }

  const addToHistory = (entry: ConsoleLogEntry): void => {
    consoleLogHistory.push(entry)

    // Keep history size manageable
    if (consoleLogHistory.length > maxHistorySize) {
      consoleLogHistory.shift()
    }
  }

  // Override console methods
  console.log = (...args: any[]) => {
    originalConsole.log(...args)
    addToHistory(createLogEntry('log', args))
  }

  console.info = (...args: any[]) => {
    originalConsole.info(...args)
    addToHistory(createLogEntry('info', args))
  }

  console.warn = (...args: any[]) => {
    originalConsole.warn(...args)
    addToHistory(createLogEntry('warn', args))
  }

  console.error = (...args: any[]) => {
    originalConsole.error(...args)
    addToHistory(createLogEntry('error', args))
  }

  console.debug = (...args: any[]) => {
    originalConsole.debug(...args)
    addToHistory(createLogEntry('debug', args))
  }

  // Capture unhandled errors
  window.addEventListener('error', (event) => {
    addToHistory({
      level: 'error',
      message: [event.message],
      timestamp: new Date().toISOString(),
      stack: event.error?.stack,
    })
  })

  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    addToHistory({
      level: 'error',
      message: [String(event.reason)],
      timestamp: new Date().toISOString(),
      stack: event.reason?.stack,
    })
  })
}

// Get recent console logs
export const getConsoleLogs = (limit = 50): ConsoleLogEntry[] => {
  return consoleLogHistory
    .slice(-limit)
    .map(log => ({ ...log })) // Return copies to prevent mutation
}

// Clear console log history (for testing)
export const clearConsoleLogs = (): void => {
  consoleLogHistory.length = 0
}

// Reset console logging (for testing)
export const resetConsoleLogging = (): void => {
  clearConsoleLogs()
  isInitialized = false

  // Restore original console methods
  if (typeof window !== 'undefined') {
    console.log = originalConsole.log
    console.info = originalConsole.info
    console.warn = originalConsole.warn
    console.error = originalConsole.error
    console.debug = originalConsole.debug
  }
}
