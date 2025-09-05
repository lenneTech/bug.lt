<script setup lang="ts">
const { openModal: openBugReport } = useBugReport()
const toast = useToast()
const runtimeConfig = useRuntimeConfig()

// Demo state
const testInput = ref<string>('')
const counter = ref<number>(0)
const position = computed(() => runtimeConfig.public.bugLt.position)

// Demo functions
const logInfo = () => {
  console.info('This is an info message from the demo', { timestamp: new Date() })
  toast.add({ title: 'Info logged', description: 'Check the console logs', color: 'info' })
}

const logWarning = () => {
  console.warn('This is a warning message', { component: 'DemoPage' })
  toast.add({ title: 'Warning logged', color: 'warning' })
}

const logError = () => {
  console.error('This is an error message', new Error('Demo error'))
  toast.add({ title: 'Error logged', color: 'error' })
}

const triggerError = () => {
  throw new Error('Intentional demo error for testing bug reports')
}

const triggerJsError = () => {
  // This will cause an unhandled error
  setTimeout(() => {
    throw new Error('Async error for testing error capture')
  }, 100)

  toast.add({
    title: 'JS Error triggered',
    description: 'An async error will occur in 100ms',
    color: 'error',
  })
}

const showSuccess = () => {
  toast.add({
    title: 'Success!',
    description: 'This is a success message',
    color: 'success',
  })
}

const incrementCounter = () => {
  counter.value++
  console.log('Counter incremented to:', counter.value)
}

// Add some initial console logs
onMounted(() => {
  console.log('Bug Report Demo page loaded')
  console.info('Available demo actions: log messages, trigger errors, test interactions')
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Navigation -->
    <nav class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
              Bug Report Module Demo
            </h1>
          </div>
          <div class="flex items-center space-x-4">
            <UButton
              color="error"
              @click="triggerError"
            >
              Trigger Error
            </UButton>
            <UButton
              color="error"
              variant="outline"
              @click="openBugReport"
            >
              Report Bug
            </UButton>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div class="space-y-8">
        <!-- Welcome Section -->
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Bug Report Module Playground
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            This playground demonstrates the bug reporting functionality. Try triggering errors,
            interacting with the page, and then use the bug report button to see how it captures
            screenshots, console logs, and browser information.
          </p>
        </div>

        <!-- Demo Actions -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UCard>
            <template #header>
              <h3 class="text-lg font-medium">
                Console Logging
              </h3>
            </template>
            <div class="space-y-3">
              <UButton
                block
                color="neutral"
                variant="outline"
                @click="logInfo"
              >
                Log Info
              </UButton>
              <UButton
                block
                color="warning"
                variant="outline"
                @click="logWarning"
              >
                Log Warning
              </UButton>
              <UButton
                block
                color="error"
                variant="outline"
                @click="logError"
              >
                Log Error
              </UButton>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <h3 class="text-lg font-medium">
                User Interactions
              </h3>
            </template>
            <div class="space-y-3">
              <UInput
                v-model="testInput"
                class="w-full"
                placeholder="Type something..."
              />
              <UButton
                block
                color="success"
                @click="showSuccess"
              >
                Show Success
              </UButton>
              <UButton
                block
                color="info"
                @click="incrementCounter"
              >
                Counter: {{ counter }}
              </UButton>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <h3 class="text-lg font-medium">
                Bug Report Controls
              </h3>
            </template>
            <div class="space-y-3">
              <UButton
                block
                color="error"
                @click="openBugReport"
              >
                Open Bug Report
              </UButton>
              <UButton
                block
                color="neutral"
                variant="outline"
                @click="triggerJsError"
              >
                Cause JS Error
              </UButton>
              <p class="text-sm text-gray-500">
                The floating bug button should appear in the {{ position }} corner.
              </p>
            </div>
          </UCard>
        </div>

        <!-- Instructions -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-medium">
              How to Test
            </h3>
          </template>
          <div class="prose dark:prose-invert max-w-none">
            <ol>
              <li>Interact with the demo buttons above to generate console logs and page activity</li>
              <li>Click the floating "Report Bug" button in the bottom right corner</li>
              <li>Fill out the bug report form with title, type, and description</li>
              <li>Optionally capture a screenshot by clicking "Capture Screenshot"</li>
              <li>Toggle browser info and console logs inclusion</li>
              <li>Submit the report (requires Linear API configuration)</li>
            </ol>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-4">
              <strong>Note:</strong> To test Linear integration, set your LINEAR_API_KEY and LINEAR_TEAM_ID
              environment variables in a .env file.
            </p>
          </div>
        </UCard>
      </div>
    </main>
  </div>
</template>
