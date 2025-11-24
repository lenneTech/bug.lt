<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'
import type { ErrorInfo } from '../types'
import { reportError } from '../utils/errorBoundary'

interface Props {
  fallback?: boolean
  showReportButton?: boolean
  onError?: (error: ErrorInfo) => void
}

interface Emits {
  (e: 'error', error: ErrorInfo): void
}

const props = withDefaults(defineProps<Props>(), {
  fallback: true,
  showReportButton: true,
})

const emit = defineEmits<Emits>()

const hasError = ref<boolean>(false)
const errorInfo = ref<ErrorInfo | null>(null)

// Capture errors from child components
onErrorCaptured((err, instance, info) => {
  const componentName = (instance as any)?.$options?.name || (instance as any)?.$options?.__name || 'Unknown'

  const error: ErrorInfo = {
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    componentName: `${componentName} (${info})`,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: window.navigator.userAgent,
  }

  hasError.value = true
  errorInfo.value = error

  // Report error to global handler
  reportError(err instanceof Error ? err : new Error(String(err)), error.componentName)

  // Call custom error handler if provided
  if (props.onError) {
    props.onError(error)
  }

  // Emit error event
  emit('error', error)

  // Prevent error from propagating further
  return false
})

const resetError = (): void => {
  hasError.value = false
  errorInfo.value = null
}

const reportBug = (): void => {
  if (errorInfo.value) {
    // Emit error event to trigger bug report modal
    emit('error', errorInfo.value)
  }
}
</script>

<template>
  <div>
    <!-- Show fallback UI if error occurred -->
    <div
      v-if="hasError && fallback"
      class="p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg"
    >
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0">
          <svg
            class="w-6 h-6 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-red-800 dark:text-red-200">
            Ein Fehler ist aufgetreten
          </h3>
          <p class="mt-2 text-sm text-red-700 dark:text-red-300">
            {{ errorInfo?.message || 'Unbekannter Fehler' }}
          </p>
          <div
            v-if="errorInfo?.stack"
            class="mt-3"
          >
            <details class="text-xs text-red-600 dark:text-red-400">
              <summary class="cursor-pointer hover:underline">
                Stack Trace anzeigen
              </summary>
              <pre class="mt-2 p-2 bg-red-100 dark:bg-red-900/20 rounded overflow-x-auto">{{ errorInfo.stack }}</pre>
            </details>
          </div>
          <div class="mt-4 flex gap-3">
            <button
              v-if="showReportButton"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
              @click="reportBug"
            >
              Fehler melden
            </button>
            <button
              class="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-red-700 dark:text-red-300 text-sm font-medium rounded-md border border-red-300 dark:border-red-700 transition-colors"
              @click="resetError"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Render children if no error -->
    <slot v-else />
  </div>
</template>
