import { createApp, ref } from 'vue'
import type { BugReportData, ErrorInfo, UseBugReportReturn, UserInteractionEvent } from '../types'
import { useRuntimeConfig } from '#imports'
import BugReportModalPlain from '../components/plain/BugReportModalPlain.vue'
import { getUserInteractions } from '../utils/userInteractions'
import { showToast } from '../utils/plainToast'

// Standalone variant of `useBugReport` used when the module runs with
// `bug: { ui: false }`. It is fully self-contained: it does NOT import from
// `#ui` / `@nuxt/ui`, mounts its own modal and shows its own toasts, so it
// works in any Nuxt project regardless of the styling stack (e.g. Tailwind v3
// or no Tailwind at all). See GitHub issue #5.

// Fallback must match the module's default `endpoint` option (src/module.ts).
const DEFAULT_ENDPOINT = '/_bug-lt/report'

const MODAL_CONTAINER_ID = 'bug-lt-modal'

// Global state for bug reporting (module-scoped singletons shared across the
// host app and the standalone modal app instance).
const isSubmitting = ref<boolean>(false)
const error = ref<string | null>(null)
const previewScreenshot = ref<string | null>(null)
const capturingScreenshot = ref<boolean>(false)
const lastError = ref<ErrorInfo | null>(null)

export const useBugReport = (): UseBugReportReturn => {
  const openModal = async (errorInfo?: ErrorInfo) => {
    if (errorInfo) {
      lastError.value = errorInfo
    }
    error.value = null

    if (typeof document === 'undefined') {
      return
    }

    // Prevent opening multiple modals at once.
    if (document.getElementById(MODAL_CONTAINER_ID)) {
      return
    }

    const container = document.createElement('div')
    container.id = MODAL_CONTAINER_ID
    document.body.appendChild(container)

    const app = createApp(BugReportModalPlain, {
      onClose: () => {
        app.unmount()
        container.remove()
      },
    })
    app.mount(container)
  }

  const getUserJourney = (): UserInteractionEvent[] => {
    return getUserInteractions()
  }

  const submitBugReport = async (data: BugReportData): Promise<void> => {
    isSubmitting.value = true
    error.value = null

    try {
      // Resolve the configured endpoint; must stay in sync with the server handler
      // route registered in src/module.ts (default: off `/api/` to dodge proxies).
      const endpoint = useRuntimeConfig().public.bugLt?.endpoint || DEFAULT_ENDPOINT
      const response: any = await $fetch(endpoint, {
        method: 'POST',
        body: data,
      })

      if (!response?.success) {
        showToast({
          type: 'error',
          title: 'Error',
          description: response?.error || 'Failed to submit bug report',
        })
        throw new Error(response?.error || 'Failed to submit bug report')
      }

      showToast({
        type: 'success',
        title: 'Success',
        description: 'Bug report submitted successfully',
      })
    }
    catch (fetchError: any) {
      error.value = fetchError.message || 'Failed to submit bug report'
      showToast({
        type: 'error',
        title: 'Error',
        description: fetchError?.message || 'Failed to submit bug report',
      })
      throw fetchError
    }
    finally {
      isSubmitting.value = false
    }
  }

  return {
    openModal,
    submitBugReport,
    getUserJourney,
    isSubmitting,
    error,
    previewScreenshot,
    capturingScreenshot,
    lastError,
  }
}
