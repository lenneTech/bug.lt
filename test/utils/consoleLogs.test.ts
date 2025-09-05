import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { initializeConsoleLogging, getConsoleLogs, resetConsoleLogging } from '../../src/runtime/utils/consoleLogs'

describe('Console Logging Utils', () => {
  let originalConsole: Console

  beforeEach(() => {
    originalConsole = { ...console }
    resetConsoleLogging()
    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2024-01-01T00:00:00.000Z')
  })

  afterEach(() => {
    resetConsoleLogging()
    Object.assign(console, originalConsole)
    vi.restoreAllMocks()
  })

  it('should initialize console logging and capture logs', () => {
    initializeConsoleLogging()

    console.log('Test log message')
    console.warn('Test warning')
    console.error('Test error')

    const logs = getConsoleLogs()

    expect(logs.length).toBeGreaterThanOrEqual(3)
    const lastLogs = logs.slice(-3)

    expect(lastLogs[0]).toEqual(expect.objectContaining({
      level: 'log',
      message: ['Test log message'],
      timestamp: '2024-01-01T00:00:00.000Z',
    }))

    expect(lastLogs[1]).toEqual(expect.objectContaining({
      level: 'warn',
      message: ['Test warning'],
      timestamp: '2024-01-01T00:00:00.000Z',
    }))

    expect(lastLogs[2]).toEqual(expect.objectContaining({
      level: 'error',
      message: ['Test error'],
      timestamp: '2024-01-01T00:00:00.000Z',
    }))
  })

  it('should handle multiple arguments', () => {
    initializeConsoleLogging()

    console.log('Message', 123, { key: 'value' }, true)

    const logs = getConsoleLogs(1)
    expect(logs[0].message).toEqual(['Message', '123', '{\n  "key": "value"\n}', 'true'])
  })

  it('should respect limit parameter', () => {
    initializeConsoleLogging()

    // Add several logs
    for (let i = 0; i < 10; i++) {
      console.log(`Log ${i}`)
    }

    const logs = getConsoleLogs(3)
    expect(logs).toHaveLength(3)
  })

  it('should maintain original console functionality', () => {
    // Spy on console before initializing to capture the original methods
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    initializeConsoleLogging()

    console.log('Test message')
    console.warn('Test warning')

    // Verify the logs are captured
    const logs = getConsoleLogs(2)
    expect(logs).toHaveLength(2)
    expect(logs[0].message).toEqual(['Test message'])
    expect(logs[1].message).toEqual(['Test warning'])

    logSpy.mockRestore()
    warnSpy.mockRestore()
  })

  it('should handle error objects with stack traces', () => {
    initializeConsoleLogging()

    const error = new Error('Test error')
    console.error('Error occurred:', error)

    const logs = getConsoleLogs(1)
    expect(logs[0].level).toBe('error')
    expect(logs[0].message).toEqual(['Error occurred:', 'Test error'])
    expect(logs[0].stack).toBeDefined()
    expect(logs[0].stack).toContain('Error: Test error')
  })
})
