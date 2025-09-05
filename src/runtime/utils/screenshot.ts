// Server-side screenshot using Puppeteer API
export const captureScreenshot = async (
  element?: HTMLElement,
  options?: {
    quality?: number
    viewport?: { width: number, height: number }
  },
): Promise<string> => {
  if (typeof window === 'undefined') {
    throw new TypeError('Screenshot capture is only available in the browser')
  }

  try {
    const selector = element ? getElementSelector(element) : undefined
    const viewport = options?.viewport || { width: 1920, height: 1080 } // Full HD as default

    // Detect current theme
    const theme = detectCurrentTheme()

    const response: any = await $fetch('/api/screenshot', {
      method: 'POST',
      body: {
        url: window.location.href,
        selector,
        viewport,
        theme,
      },
    })

    if (!response?.success) {
      throw new Error(response.message || 'Screenshot failed')
    }

    return response.screenshot
  }
  catch (error) {
    console.error('Server-side screenshot failed:', error)
    throw new Error('Screenshot-Erfassung fehlgeschlagen')
  }
}

// Helper function to detect current theme
function detectCurrentTheme(): 'light' | 'dark' {
  // Check Nuxt Color Mode
  if (typeof window !== 'undefined' && window.__NUXT_COLOR_MODE__) {
    return window.__NUXT_COLOR_MODE__.value === 'dark' ? 'dark' : 'light'
  }

  // Check document classes
  if (typeof document !== 'undefined') {
    if (document.documentElement.classList.contains('dark')) {
      return 'dark'
    }
    if (document.documentElement.classList.contains('light')) {
      return 'light'
    }
  }

  // Check CSS media query as fallback
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  // Default to light theme
  return 'light'
}

// Helper function to generate a selector for an element
function getElementSelector(element: HTMLElement): string {
  if (element.id) {
    return `#${element.id}`
  }

  if (element.className) {
    const classes = element.className.split(' ').filter(c => c.length > 0)
    if (classes.length > 0) {
      return `.${classes.join('.')}`
    }
  }

  // Fallback to tag name
  return element.tagName.toLowerCase()
}
