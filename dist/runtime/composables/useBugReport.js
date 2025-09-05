import { ref } from "vue";
import { useOverlay } from "#ui/composables/useOverlay";
import BugReportModal from "../components/BugReportModal.vue";
const isSubmitting = ref(false);
const error = ref(null);
const previewScreenshot = ref(null);
const capturingScreenshot = ref(false);
export const useBugReport = () => {
  const overlay = useOverlay();
  const openModal = async () => {
    const modal = overlay.create(BugReportModal);
    modal.open();
    error.value = null;
  };
  const submitBugReport = async (data) => {
    isSubmitting.value = true;
    error.value = null;
    try {
      const response = await $fetch("/api/bug-report", {
        method: "POST",
        body: data
      });
      if (!response?.success) {
        throw new Error(response?.error || "Failed to submit bug report");
      }
    } catch (fetchError) {
      error.value = fetchError.message || "Failed to submit bug report";
      throw fetchError;
    } finally {
      isSubmitting.value = false;
    }
  };
  return {
    openModal,
    submitBugReport,
    isSubmitting,
    error,
    previewScreenshot,
    capturingScreenshot
  };
};
