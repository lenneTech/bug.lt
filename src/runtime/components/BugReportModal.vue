<script setup lang="ts">
import { ref } from 'vue'
import { useBugReport } from '../composables/useBugReport'
import type { BugReportData } from '../types'
import BugReportForm from './BugReportForm.vue'

const emit = defineEmits<{ close: [boolean] }>()

const { submitBugReport, isSubmitting, error } = useBugReport()
const formRef = ref<InstanceType<typeof BugReportForm> | null>(null)

const clearError = () => {
  error.value = null
}

const handleSubmit = async (data: BugReportData) => {
  await submitBugReport(data)
  emit('close', true)
}

const triggerSubmit = () => {
  formRef.value?.submit()
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
          ref="formRef"
          :is-submitting="isSubmitting"
          @submit="handleSubmit"
        />
      </div>
    </template>

    <template #footer>
      <div class="flex items-center justify-between">
        <UButton
          color="neutral"
          variant="outline"
          :disabled="isSubmitting"
          @click="emit('close', false)"
        >
          Abbrechen
        </UButton>
        <UButton
          color="error"
          :loading="isSubmitting"
          :disabled="!formRef?.isValid"
          @click="triggerSubmit"
        >
          Senden
        </UButton>
      </div>
    </template>
  </UModal>
</template>
