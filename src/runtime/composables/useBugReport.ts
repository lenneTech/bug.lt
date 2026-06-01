import { ref } from 'vue'
import type { BugReportData, ErrorInfo, UseBugReportReturn, UserInteractionEvent } from '../types'
import { useOverlay } from '#ui/composables/useOverlay'
import { useToast } from '#ui/composables/useToast'
import { useRuntimeConfig } from '#imports'
import BugReportModal from '../components/BugReportModal.vue'
import { getUserInteractions } from '../utils/userInteractions'

// Fallback must match the module's default `endpoint` option (src/module.ts).
const DEFAULT_ENDPOINT = '/_bug-lt/report'

// Global state for bug reporting
const isSubmitting = ref<boolean>(false)
const error = ref<string | null>(null)
const previewScreenshot = ref<string | null>(null)
const capturingScreenshot = ref<boolean>(false)
const lastError = ref<ErrorInfo | null>(null)

export const useBugReport = (): UseBugReportReturn => {
  const overlay = useOverlay()
  const toast = useToast()

  const openModal = async (errorInfo?: ErrorInfo) => {
    if (errorInfo) {
      lastError.value = errorInfo
    }
    const modal = overlay.create(BugReportModal)
    modal.open()
    error.value = null
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
        toast.add({
          icon: 'i-bi-x-circle',
          title: 'Error',
          description: response?.error || 'Failed to submit bug report',
          color: 'error',
          duration: 7000,
        })
        throw new Error(response?.error || 'Failed to submit bug report')
      }

      toast.add({
        icon: 'i-bi-check-circle',
        title: 'Success',
        description: 'Bug report submitted successfully',
        color: 'success',
        duration: 5000,
      })
    }
    catch (fetchError: any) {
      error.value = fetchError.message || 'Failed to submit bug report'
      toast.add({
        icon: 'i-bi-x-circle',
        title: 'Error',
        description: fetchError?.message || 'Failed to submit bug report',
        color: 'error',
        duration: 7000,
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
