import { ref } from 'vue'
import type { BugReportData, UseBugReportReturn } from '../types'
import { useOverlay } from '#ui/composables/useOverlay'
import { useToast } from '#ui/composables/useToast'
import BugReportModal from '../components/BugReportModal.vue'

// Global state for bug reporting
const isSubmitting = ref<boolean>(false)
const error = ref<string | null>(null)
const previewScreenshot = ref<string | null>(null)
const capturingScreenshot = ref<boolean>(false)

export const useBugReport = (): UseBugReportReturn => {
  const overlay = useOverlay()
  const toast = useToast()

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
    isSubmitting,
    error,
    previewScreenshot,
    capturingScreenshot,
  }
}
