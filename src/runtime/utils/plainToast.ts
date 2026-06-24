// Dependency-free toast notifications for the `ui: false` (standalone) mode.
//
// The default `@nuxt/ui` based flow uses `useToast()` for feedback. When the
// module runs without `@nuxt/ui` we cannot rely on `#ui`, so this util renders
// a small, self-contained toast directly into the DOM with inline styles. No
// Tailwind / external CSS required, so it works in any project regardless of
// the styling stack.

export type PlainToastType = 'success' | 'error'

export interface PlainToastOptions {
  type?: PlainToastType
  title?: string
  description?: string
  /** Auto-dismiss after this many milliseconds. */
  duration?: number
}

const CONTAINER_ID = 'bug-lt-toast-container'

const COLORS: Record<PlainToastType, { bg: string, border: string, icon: string }> = {
  success: { bg: '#ecfdf5', border: '#10b981', icon: '#059669' },
  error: { bg: '#fef2f2', border: '#ef4444', icon: '#dc2626' },
}

// Inline SVG icons so we don't depend on any icon library.
const ICONS: Record<PlainToastType, string> = {
  success:
    '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z" clip-rule="evenodd" />',
  error:
    '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 5a1 1 0 012 0v5a1 1 0 11-2 0V5zm1 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />',
}

function ensureContainer(): HTMLElement {
  let container = document.getElementById(CONTAINER_ID)
  if (!container) {
    container = document.createElement('div')
    container.id = CONTAINER_ID
    container.style.cssText = [
      'position:fixed',
      'top:16px',
      'right:16px',
      'z-index:2147483647',
      'display:flex',
      'flex-direction:column',
      'gap:8px',
      'max-width:360px',
      'font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif',
    ].join(';')
    document.body.appendChild(container)
  }
  return container
}

/**
 * Show a self-contained toast notification. No-op on the server.
 */
export function showToast(options: PlainToastOptions = {}): void {
  if (typeof document === 'undefined') {
    return
  }

  const type: PlainToastType = options.type ?? 'success'
  const duration = options.duration ?? (type === 'error' ? 7000 : 5000)
  const colors = COLORS[type]

  const container = ensureContainer()

  const toast = document.createElement('div')
  toast.style.cssText = [
    'display:flex',
    'align-items:flex-start',
    'gap:10px',
    'padding:12px 14px',
    'border-radius:8px',
    `background:${colors.bg}`,
    `border:1px solid ${colors.border}`,
    'box-shadow:0 4px 12px rgba(0,0,0,0.12)',
    'color:#111827',
    'font-size:14px',
    'line-height:1.4',
    'opacity:0',
    'transform:translateX(16px)',
    'transition:opacity .2s ease,transform .2s ease',
  ].join(';')

  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="${colors.icon}" style="flex-shrink:0;margin-top:1px;">${ICONS[type]}</svg>
    <div style="flex:1;min-width:0;">
      ${options.title ? `<div style="font-weight:600;">${escapeHtml(options.title)}</div>` : ''}
      ${options.description ? `<div style="color:#374151;">${escapeHtml(options.description)}</div>` : ''}
    </div>
  `

  container.appendChild(toast)

  // Animate in on next frame.
  requestAnimationFrame(() => {
    toast.style.opacity = '1'
    toast.style.transform = 'translateX(0)'
  })

  const remove = () => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateX(16px)'
    setTimeout(() => {
      toast.remove()
      if (container.childElementCount === 0) {
        container.remove()
      }
    }, 200)
  }

  setTimeout(remove, duration)
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
