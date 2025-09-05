import { ref } from 'vue'
import type { BugReportData, UseBugReportReturn } from '../types'
import { useOverlay } from '#ui/composables/useOverlay'
import BugReportModal from '../components/BugReportModal.vue'

// Global state for bug reporting
const isSubmitting = ref<boolean>(false)
const error = ref<string | null>(null)
const previewScreenshot = ref<string | null>(null)
const capturingScreenshot = ref<boolean>(false)

export const useBugReport = (): UseBugReportReturn => {
  const overlay = useOverlay()

  const openModal = async () => {
    const modal = overlay.create(BugReportModal)
    modal.open()
    error.value = null
  }

  const submitBugReport = async (data: BugReportData): Promise<void> => {
    isSubmitting.value = true
    error.value = null

    try {
      const response: any = await $fetch('/api/bug-report', {
        method: 'POST',
        body: data,
      })

      if (!response?.success) {
        throw new Error(response?.error || 'Failed to submit bug report')
      }
    }
    catch (fetchError: any) {
      error.value = fetchError.message || 'Failed to submit bug report'
      throw fetchError
    }
    finally {
      isSubmitting.value = false
    }
  }

  return {
    openModal,
    submitBugReport,
    isSubmitting,
    error,
    previewScreenshot,
    capturingScreenshot,
  }
}
