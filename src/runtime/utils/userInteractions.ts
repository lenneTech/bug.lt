import type { UserInteractionEvent, UserJourneyConfig } from '../types'

// Global storage for user interactions (circular buffer)
const userInteractionHistory: UserInteractionEvent[] = []
let maxHistorySize = 50

// Configuration - optimized defaults for bug reporting
let config: UserJourneyConfig = {
  enabled: true,
  maxEvents: 50,
  captureClicks: true,
  captureNavigation: true,
  captureFormInteractions: true,
  captureHover: false, // Disabled: Too noisy, not useful for bug reproduction
  captureScroll: false, // Disabled: Too noisy, not useful for bug reproduction
  captureInputChanges: false, // Disabled: form_change captures final values
  captureInputValues: false,
  captureKeyboard: true,
  captureErrors: true,
  captureModalEvents: true,
  throttleRate: 100,
}

let isInitialized = false
let listeners: Array<{ element: any, event: string, handler: any, options?: any }> = []

// Throttle helper for high-frequency events
const throttle = (func: any, delay: number): any => {
  let timeoutId: NodeJS.Timeout | null = null
  let lastExecTime = 0

  return function (this: any, ...args: any[]) {
    const currentTime = Date.now()

    if (currentTime - lastExecTime >= delay) {
      lastExecTime = currentTime
      func.apply(this, args)
    }
    else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastExecTime = Date.now()
        func.apply(this, args)
        timeoutId = null
      }, delay - (currentTime - lastExecTime))
    }
  }
}

// Sensitive data detection
const isSensitiveField = (element: HTMLElement): boolean => {
  if (element instanceof HTMLInputElement) {
    const type = element.type.toLowerCase()
    const name = element.name?.toLowerCase() || ''
    const id = element.id?.toLowerCase() || ''

    // Password fields
    if (type === 'password') return true

    // Credit card patterns
    if (
      name.includes('card')
      || name.includes('credit')
      || id.includes('card')
      || id.includes('credit')
      || name.includes('cvv')
      || name.includes('cvc')
    ) {
      return true
    }

    // Security codes, tokens, pins
    if (
      name.includes('token')
      || name.includes('secret')
      || name.includes('pin')
      || name.includes('ssn')
      || id.includes('token')
      || id.includes('secret')
    ) {
      return true
    }
  }

  return false
}

// Filter sensitive data from URLs
const sanitizeUrl = (url: string): string => {
  try {
    const urlObj = new URL(url)

    // Remove potential tokens from query params
    const sensitiveParams = ['token', 'apikey', 'api_key', 'secret', 'password', 'pwd']
    sensitiveParams.forEach((param) => {
      if (urlObj.searchParams.has(param)) {
        urlObj.searchParams.set(param, '[FILTERED]')
      }
    })

    return urlObj.toString()
  }
  catch {
    return url
  }
}

// Get element selector/description
const getElementDescription = (element: HTMLElement): {
  target: string
  element: string
  tag: string
  id?: string
  classes?: string[]
  text?: string
} => {
  const tag = element.tagName.toLowerCase()
  const id = element.id || undefined
  const classes = element.className ? Array.from(element.classList) : undefined
  const text = element.textContent?.trim().substring(0, 50) || undefined

  // Build target string (CSS selector style)
  let target = tag
  if (id) target += `#${id}`
  if (classes && classes.length > 0) target += `.${classes.join('.')}`

  return {
    target,
    element: target,
    tag,
    id,
    classes,
    text,
  }
}

// Add event to history (circular buffer)
const addToHistory = (event: UserInteractionEvent): void => {
  userInteractionHistory.push(event)

  // Circular buffer: remove oldest when max size reached
  if (userInteractionHistory.length > maxHistorySize) {
    userInteractionHistory.shift()
  }
}

// Create and add interaction event
const recordInteraction = (
  type: UserInteractionEvent['type'],
  target: string,
  metadata?: UserInteractionEvent['metadata'],
): void => {
  if (!config.enabled) return

  const event: UserInteractionEvent = {
    type,
    target,
    timestamp: new Date().toISOString(),
    metadata,
  }

  addToHistory(event)
}

// Initialize user interaction tracking
export const initializeUserJourneyTracking = (userConfig?: Partial<UserJourneyConfig>): void => {
  if (isInitialized || typeof window === 'undefined') return

  // Merge config
  config = { ...config, ...userConfig }
  maxHistorySize = config.maxEvents || 50

  isInitialized = true

  // Click tracking
  if (config.captureClicks) {
    const clickHandler = (e: MouseEvent): void => {
      const target = e.target as HTMLElement
      if (!target) return

      const description = getElementDescription(target)
      recordInteraction('click', description.target, description)
    }

    window.addEventListener('click', clickHandler, { passive: true, capture: true })
    listeners.push({ element: window, event: 'click', handler: clickHandler, options: { passive: true, capture: true } })
  }

  // Navigation tracking
  if (config.captureNavigation) {
    const recordNavigation = (fromUrl: string, toUrl: string): void => {
      recordInteraction('navigation', toUrl, {
        fromUrl: sanitizeUrl(fromUrl),
        toUrl: sanitizeUrl(toUrl),
        url: sanitizeUrl(toUrl),
      })
    }

    // Track initial page load
    recordInteraction('navigation', window.location.href, {
      url: sanitizeUrl(window.location.href),
      toUrl: sanitizeUrl(window.location.href),
    })

    // Track history API navigation (SPA)
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = function (...args) {
      const prevUrl = window.location.href
      originalPushState.apply(history, args)
      const newUrl = window.location.href
      if (prevUrl !== newUrl) {
        recordNavigation(prevUrl, newUrl)
      }
    }

    history.replaceState = function (...args) {
      const prevUrl = window.location.href
      originalReplaceState.apply(history, args)
      const newUrl = window.location.href
      if (prevUrl !== newUrl) {
        recordNavigation(prevUrl, newUrl)
      }
    }

    // Track popstate (back/forward)
    const popstateHandler = (): void => {
      recordInteraction('navigation', window.location.href, {
        url: sanitizeUrl(window.location.href),
        toUrl: sanitizeUrl(window.location.href),
      })
    }

    window.addEventListener('popstate', popstateHandler, { passive: true })
    listeners.push({ element: window, event: 'popstate', handler: popstateHandler, options: { passive: true } })
  }

  // Form submission tracking
  if (config.captureFormInteractions) {
    const submitHandler = (e: Event): void => {
      const form = e.target as HTMLFormElement
      if (!form) return

      const description = getElementDescription(form)
      recordInteraction('form_submit', description.target, description)
    }

    window.addEventListener('submit', submitHandler, { passive: true, capture: true })
    listeners.push({ element: window, event: 'submit', handler: submitHandler, options: { passive: true, capture: true } })

    // Form field changes
    const changeHandler = (e: Event): void => {
      const target = e.target as HTMLElement
      if (!target) return

      if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement) {
        const description = getElementDescription(target)

        let value: string | undefined
        if (config.captureInputValues && !isSensitiveField(target)) {
          value = target.value?.substring(0, 50) // Limit length
        }

        recordInteraction('form_change', description.target, {
          ...description,
          value: value || undefined,
        })
      }
    }

    window.addEventListener('change', changeHandler, { passive: true, capture: true })
    listeners.push({ element: window, event: 'change', handler: changeHandler, options: { passive: true, capture: true } })
  }

  // Input changes (real-time)
  if (config.captureInputChanges) {
    const inputHandler = throttle((e: Event) => {
      const target = e.target as HTMLElement
      if (!target) return

      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        const description = getElementDescription(target)

        let value: string | undefined
        if (config.captureInputValues && !isSensitiveField(target)) {
          value = target.value?.substring(0, 50)
        }

        recordInteraction('input_change', description.target, {
          ...description,
          value: value || undefined,
        })
      }
    }, config.throttleRate || 100)

    window.addEventListener('input', inputHandler as EventListener, { passive: true, capture: true })
    listeners.push({ element: window, event: 'input', handler: inputHandler, options: { passive: true, capture: true } })
  }

  // Hover tracking (throttled)
  if (config.captureHover) {
    const hoverHandler = throttle((e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target) return

      const description = getElementDescription(target)
      recordInteraction('hover', description.target, description)
    }, config.throttleRate || 100)

    window.addEventListener('mouseover', hoverHandler as EventListener, { passive: true, capture: true })
    listeners.push({ element: window, event: 'mouseover', handler: hoverHandler, options: { passive: true, capture: true } })
  }

  // Scroll tracking (throttled)
  if (config.captureScroll) {
    const scrollHandler = throttle(() => {
      const scrollPosition = window.scrollY || document.documentElement.scrollTop

      recordInteraction('scroll', 'window', {
        scrollPosition,
      })
    }, config.throttleRate || 100)

    window.addEventListener('scroll', scrollHandler as EventListener, { passive: true })
    listeners.push({ element: window, event: 'scroll', handler: scrollHandler, options: { passive: true } })
  }

  // Keyboard tracking
  if (config.captureKeyboard) {
    const keyHandler = (e: KeyboardEvent): void => {
      // Only capture keyboard shortcuts (with modifiers) to avoid capturing typed text
      if (e.ctrlKey || e.metaKey || e.altKey) {
        recordInteraction('keyboard', e.key, {
          key: e.key,
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
          altKey: e.altKey,
          shiftKey: e.shiftKey,
        })
      }
    }

    window.addEventListener('keydown', keyHandler, { passive: true })
    listeners.push({ element: window, event: 'keydown', handler: keyHandler, options: { passive: true } })
  }

  // Error tracking
  if (config.captureErrors) {
    const errorHandler = (event: ErrorEvent): void => {
      recordInteraction('error', 'window', {
        errorMessage: event.message,
        url: sanitizeUrl(event.filename || ''),
      })
    }

    window.addEventListener('error', errorHandler, { passive: true })
    listeners.push({ element: window, event: 'error', handler: errorHandler, options: { passive: true } })

    const rejectionHandler = (event: PromiseRejectionEvent): void => {
      recordInteraction('error', 'window', {
        errorMessage: String(event.reason),
      })
    }

    window.addEventListener('unhandledrejection', rejectionHandler, { passive: true })
    listeners.push({ element: window, event: 'unhandledrejection', handler: rejectionHandler, options: { passive: true } })
  }
}

// Stop tracking and cleanup
export const stopUserJourneyTracking = (): void => {
  if (!isInitialized || typeof window === 'undefined') return

  // Remove all event listeners
  listeners.forEach(({ element, event, handler, options }) => {
    element.removeEventListener(event, handler, options)
  })

  listeners = []
  isInitialized = false
}

// Get user interactions
export const getUserInteractions = (limit?: number): UserInteractionEvent[] => {
  const actualLimit = limit || maxHistorySize
  return userInteractionHistory
    .slice(-actualLimit)
    .map(interaction => ({ ...interaction })) // Return copies to prevent mutation
}

// Clear interaction history
export const clearUserInteractions = (): void => {
  userInteractionHistory.length = 0
}

// Record custom interaction (for manual tracking)
export const recordCustomInteraction = (
  type: UserInteractionEvent['type'],
  target: string,
  metadata?: UserInteractionEvent['metadata'],
): void => {
  recordInteraction(type, target, metadata)
}

// Reset tracking (for testing)
export const resetUserJourneyTracking = (): void => {
  stopUserJourneyTracking()
  clearUserInteractions()
}
