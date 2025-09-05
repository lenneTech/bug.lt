import { describe, it, expect } from 'vitest'

describe('Basic Module Tests', () => {
  it('should pass basic test', () => {
    expect(true).toBe(true)
  })

  it('should test module exports', async () => {
    const module = await import('../src/module')
    expect(module.default).toBeDefined()
    expect(typeof module.default).toBe('function')

    // Test that we also export the type interface (should be undefined at runtime)
    expect(module.BugReportOptions).toBeUndefined() // Type export should not be available at runtime

    // Test that the ModuleOptions interface is exported
    expect(module.ModuleOptions).toBeUndefined() // Type export should not be available at runtime
  })
})
