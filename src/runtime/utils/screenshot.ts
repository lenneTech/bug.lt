import { domToPng } from 'modern-screenshot'

export interface ScreenshotOptions {
  quality?: number
  scale?: number
  backgroundColor?: string
}

/**
 * Client-side screenshot capture using modern-screenshot
 * Captures the current viewport (visible area) with all DOM state
 */
export async function captureScreenshot(
  element?: HTMLElement,
  options: ScreenshotOptions = {},
): Promise<string> {
  if (typeof window === 'undefined') {
    throw new TypeError('Screenshot capture is only available in the browser')
  }

  const targetElement: HTMLElement = element || document.documentElement
  const scale: number = options.scale || window.devicePixelRatio || 1

  // Detect background color from theme
  const isDark: boolean = detectCurrentTheme() === 'dark'
  const backgroundColor: string = options.backgroundColor || (isDark ? '#0a0a0a' : '#ffffff')

  try {
    const dataUrl: string = await domToPng(targetElement, {
      scale,
      backgroundColor,
      // Capture only the visible viewport
      width: window.innerWidth,
      height: window.innerHeight,
      style: {
        // Ensure we capture from the top-left of the viewport
        transform: 'none',
        transformOrigin: 'top left',
      },
      // Handle CORS images gracefully
      fetch: {
        requestInit: {
          mode: 'cors',
        },
        bypassingCache: true,
      },
    })

    return dataUrl
  }
  catch (error) {
    console.error('Screenshot capture failed:', error)
    throw new Error('Screenshot-Erfassung fehlgeschlagen')
  }
}

/**
 * Detect current theme from Nuxt Color Mode, document classes, or system preference
 */
function detectCurrentTheme(): 'light' | 'dark' {
  // Check Nuxt Color Mode
  if (typeof window !== 'undefined' && (window as any).__NUXT_COLOR_MODE__) {
    return (window as any).__NUXT_COLOR_MODE__.value === 'dark' ? 'dark' : 'light'
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

  return 'light'
}
