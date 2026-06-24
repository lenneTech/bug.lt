<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useBugReport } from '../../composables/useBugReport.plain'
import type { BugReportData } from '../../types'
import BugReportFormPlain from './BugReportFormPlain.vue'

// Standalone (no @nuxt/ui) variant of BugReportModal for `ui: false` mode.
// Mounted as its own Vue app by useBugReport.plain.openModal(); communicates
// back via the `close` event.

const emit = defineEmits<{ close: [boolean] }>()

const { submitBugReport, isSubmitting, error } = useBugReport()
const formRef = ref<InstanceType<typeof BugReportFormPlain> | null>(null)

const clearError = () => {
  error.value = null
}

const close = (submitted: boolean) => {
  emit('close', submitted)
}

const handleSubmit = async (data: BugReportData) => {
  await submitBugReport(data)
  close(true)
}

const triggerSubmit = () => {
  formRef.value?.submit()
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && !isSubmitting.value) {
    close(false)
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div
    class="buglt-overlay"
    @click.self="!isSubmitting && close(false)"
  >
    <div
      class="buglt-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="buglt-dialog-title"
    >
      <!-- Header -->
      <div class="buglt-dialog__header">
        <h2
          id="buglt-dialog-title"
          class="buglt-dialog__title"
        >
          Fehler melden
        </h2>
        <button
          type="button"
          class="buglt-dialog__close"
          :disabled="isSubmitting"
          aria-label="Schließen"
          @click="close(false)"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="buglt-dialog__body">
        <div
          v-if="error"
          class="buglt-alert"
        >
          <span class="buglt-alert__text">{{ error }}</span>
          <button
            type="button"
            class="buglt-alert__close"
            aria-label="Fehler ausblenden"
            @click="clearError"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <BugReportFormPlain
          ref="formRef"
          :is-submitting="isSubmitting"
          @submit="handleSubmit"
        />
      </div>

      <!-- Footer -->
      <div class="buglt-dialog__footer">
        <button
          type="button"
          class="buglt-btn buglt-btn--ghost"
          :disabled="isSubmitting"
          @click="close(false)"
        >
          Abbrechen
        </button>
        <button
          type="button"
          class="buglt-btn buglt-btn--danger"
          :disabled="isSubmitting || !formRef?.isValid"
          @click="triggerSubmit"
        >
          <span
            v-if="isSubmitting"
            class="buglt-spinner"
          />
          {{ isSubmitting ? 'Senden...' : 'Senden' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.buglt-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483646;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 24px 16px;
  background: rgba(0, 0, 0, .5);
  overflow-y: auto;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}

.buglt-dialog {
  width: 100%;
  max-width: 42rem;
  margin: auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, .3);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 48px);
}

.buglt-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.buglt-dialog__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.buglt-dialog__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #6b7280;
  border-radius: 6px;
  cursor: pointer;
}

.buglt-dialog__close:hover:not(:disabled) {
  background: #f3f4f6;
  color: #111827;
}

.buglt-dialog__close:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.buglt-dialog__close svg {
  width: 18px;
  height: 18px;
}

.buglt-dialog__body {
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.buglt-alert {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #b91c1c;
}

.buglt-alert__text {
  font-size: 14px;
}

.buglt-alert__close {
  flex-shrink: 0;
  display: inline-flex;
  border: none;
  background: transparent;
  color: #b91c1c;
  cursor: pointer;
}

.buglt-alert__close svg {
  width: 16px;
  height: 16px;
}

.buglt-dialog__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
}

.buglt-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background-color .15s ease;
}

.buglt-btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.buglt-btn--ghost {
  background: #fff;
  border-color: #d1d5db;
  color: #374151;
}

.buglt-btn--ghost:hover:not(:disabled) {
  background: #f9fafb;
}

.buglt-btn--danger {
  background: #ef4444;
  color: #fff;
}

.buglt-btn--danger:hover:not(:disabled) {
  background: #dc2626;
}

.buglt-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, .5);
  border-top-color: #fff;
  border-radius: 9999px;
  animation: buglt-spin .6s linear infinite;
}

@keyframes buglt-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
