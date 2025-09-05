<script setup lang="ts">
import { useBugReport } from '../composables/useBugReport'
import type { BugReportData } from '../types'
import BugReportForm from './BugReportForm.vue'

const emit = defineEmits<{ close: [boolean] }>()

const { submitBugReport, isSubmitting, error } = useBugReport()

const clearError = () => {
  error.value = null
}

const handleSubmit = async (data: BugReportData) => {
  await submitBugReport(data)
  emit('close', true)
}
</script>

<template>
  <UModal
    :close="{ onClick: () => emit('close', false) }"
    title="Fehler melden"
    class="w-full max-w-2xl"
  >
    <template #body>
      <div class="space-y-4 w-full">
        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          :title="error"
          :close-button="{ color: 'error', variant: 'ghost' }"
          @close="clearError"
        />

        <BugReportForm
          :is-submitting="isSubmitting"
          @submit="handleSubmit"
          @cancel="emit('close', false)"
        />
      </div>
    </template>
  </UModal>
</template>
