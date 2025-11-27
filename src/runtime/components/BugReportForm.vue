<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { z } from 'zod'
import { useRuntimeConfig } from '#imports'
import type { AttachmentFile, BugReportConfig, BugReportData, BugReportType } from '../types'
import { getBrowserInfo } from '../utils/browserInfo'
import { getConsoleLogs } from '../utils/consoleLogs'
import { getNetworkRequests } from '../utils/networkRequests'
import { useBugReport } from '../composables/useBugReport'
import AttachmentsList from './AttachmentsList.vue'
import UserJourneyTimeline from './UserJourneyTimeline.vue'

interface Props {
  isSubmitting?: boolean
}

interface Emits {
  (e: 'submit', data: BugReportData): void

  (e: 'cancel'): void
}

withDefaults(defineProps<Props>(), {
  isSubmitting: false,
})

const emit = defineEmits<Emits>()

const runtimeConfig = useRuntimeConfig()
const { previewScreenshot, lastError, getUserJourney } = useBugReport()

const config = computed((): BugReportConfig => runtimeConfig.public.bugLt as BugReportConfig)

const schema = z.object({
  title: z.string().min(1, 'Titel ist erforderlich'),
  type: z.enum(['bug', 'feature', 'enhancement', 'other']),
  description: z.string().min(1, 'Beschreibung ist erforderlich'),
  expectedBehavior: z.string().optional(),
  stepsToReproduce: z.string().optional(),
})

const state = reactive({
  title: '',
  type: '' as BugReportType,
  description: '',
  expectedBehavior: '',
  stepsToReproduce: '',
})

// Pre-fill form if error info is available
watch(lastError, (errorInfo) => {
  if (errorInfo) {
    state.title = errorInfo.message.substring(0, 100)
    state.type = 'bug'
    state.description = `**Error Message:**\n${errorInfo.message}\n\n**Component:** ${errorInfo.componentName || 'Unknown'}\n\n**Stack Trace:**\n\`\`\`\n${errorInfo.stack || 'No stack trace available'}\n\`\`\``
  }
}, { immediate: true })

const typeOptions = [
  { label: 'Bug', value: 'bug' },
  { label: 'Feature', value: 'feature' },
  { label: 'Verbesserung', value: 'enhancement' },
  { label: 'Sonstiges', value: 'other' },
]

const accordionItems = [
  {
    label: 'Zusätzliche Informationen',
    icon: 'i-heroicons-information-circle',
    content: 'Browser-Informationen und Konsolen-Logs',
  },
]

const attachments = ref<AttachmentFile[]>([])
const includeBrowserInfo = ref<boolean>(true)
const includeConsoleLogs = ref<boolean>(true)
const includeNetworkRequests = ref<boolean>(true)
const includeUserJourney = ref<boolean>(true)

const userJourneyEvents = computed(() => getUserJourney())

// Watch for pre-captured screenshot changes
watch(previewScreenshot, (newScreenshot) => {
  if (newScreenshot && !attachments.value.some(a => a.isScreenshot)) {
    // Calculate screenshot size from data URL
    const screenshotSize = Math.round((newScreenshot.length - 'data:image/png;base64,'.length) * 0.75)

    const screenshotAttachment: AttachmentFile = {
      id: 'screenshot-' + Date.now(),
      name: 'screenshot.png',
      type: 'image/png',
      size: screenshotSize,
      data: newScreenshot,
      isScreenshot: true,
      preview: newScreenshot,
    }
    attachments.value.unshift(screenshotAttachment)
  }
}, { immediate: true })

const addAttachments = (newAttachments: AttachmentFile[]) => {
  attachments.value.push(...newAttachments)
}

const removeAttachment = (id: string) => {
  attachments.value = attachments.value.filter(a => a.id !== id)
}

const hasScreenshot = computed(() => attachments.value.some(a => a.isScreenshot))

const onSubmit = async () => {
  const serializedAttachments = attachments.value.map(attachment => ({
    id: attachment.id,
    name: attachment.name,
    type: attachment.type,
    size: attachment.size,
    data: attachment.data,
    isScreenshot: attachment.isScreenshot,
    preview: attachment.preview,
  }))

  const data: BugReportData = {
    title: state.title,
    type: state.type,
    description: state.description,
    expectedBehavior: state.expectedBehavior || undefined,
    stepsToReproduce: state.stepsToReproduce || undefined,
    screenshot: attachments.value.find(a => a.isScreenshot)?.data as string,
    attachments: serializedAttachments,
  }

  if (includeBrowserInfo.value && config.value?.enableBrowserInfo) {
    data.browserInfo = getBrowserInfo()
  }

  if (includeConsoleLogs.value && config.value?.enableConsoleLogs) {
    data.consoleLogs = getConsoleLogs(config.value?.maxConsoleLogs)
  }

  if (includeNetworkRequests.value && config.value?.enableNetworkRequests) {
    data.networkRequests = getNetworkRequests(config.value?.maxNetworkRequests)
  }

  if (includeUserJourney.value && config.value?.enableUserJourney) {
    data.userInteractions = getUserJourney()
  }

  emit('submit', data)
}
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    loading-auto
    class="space-y-4 w-full"
    @submit="onSubmit"
  >
    <!-- Title -->
    <UFormField
      label="Titel"
      name="title"
      required
    >
      <UInput
        v-model="state.title"
        class="w-full"
        placeholder="Kurze Beschreibung des Problems"
        :disabled="isSubmitting"
      />
    </UFormField>

    <!-- Type -->
    <UFormField
      label="Typ"
      name="type"
      required
    >
      <USelect
        v-model="state.type"
        class="w-full"
        :items="typeOptions"
        placeholder="Typ auswählen"
        :disabled="isSubmitting"
      />
    </UFormField>

    <!-- Description -->
    <UFormField
      label="Beschreibung"
      name="description"
      required
    >
      <UTextarea
        v-model="state.description"
        placeholder="Was ist passiert..."
        class="w-full"
        :rows="4"
        :disabled="isSubmitting"
      />
    </UFormField>

    <!-- Expected Behavior -->
    <UFormField
      label="Erwartetes Verhalten"
      name="expectedBehavior"
    >
      <UTextarea
        v-model="state.expectedBehavior"
        class="w-full"
        placeholder="Was hätten Sie erwartet?"
        :rows="3"
        :disabled="isSubmitting"
      />
    </UFormField>

    <!-- Steps to Reproduce -->
    <UFormField
      label="Schritte zur Reproduktion"
      name="stepsToReproduce"
    >
      <UTextarea
        v-model="state.stepsToReproduce"
        class="w-full"
        placeholder="1. Gehe zu... 2. Klicke auf... 3. Fehler erscheint"
        :rows="3"
        :disabled="isSubmitting"
      />
    </UFormField>

    <!-- Attachments Section -->
    <div class="space-y-3">
      <label class="text-sm font-medium text-gray-700 dark:text-gray-200">
        Anhänge
        <span
          v-if="hasScreenshot"
          class="text-xs text-gray-500 dark:text-gray-400 font-normal ml-2"
        >
          (Screenshot automatisch erfasst)
        </span>
      </label>

      <AttachmentsList
        :attachments="attachments"
        :disabled="isSubmitting"
        @add="addAttachments"
        @remove="removeAttachment"
      />
    </div>

    <!-- Additional Data Toggle -->
    <UAccordion
      :items="accordionItems"
      class="w-full"
    >
      <template #content>
        <div class="space-y-3">
          <!-- Browser Info Toggle -->
          <div
            v-if="config?.enableBrowserInfo"
            class="flex items-center justify-between"
          >
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-200">
                Browser-Informationen auslesen
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Browser, Betriebssystem, Bildschirmgröße, etc.
              </p>
            </div>
            <USwitch
              v-model="includeBrowserInfo"
              :disabled="isSubmitting"
            />
          </div>

          <!-- Console Logs Toggle -->
          <div
            v-if="config?.enableConsoleLogs"
            class="flex items-center justify-between"
          >
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-200">
                Konsolen-Logs auslesen
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Aktuelle Browser-Konsolennachrichten
              </p>
            </div>
            <USwitch
              v-model="includeConsoleLogs"
              :disabled="isSubmitting"
            />
          </div>

          <!-- Network Requests Toggle -->
          <div
            v-if="config?.enableNetworkRequests"
            class="flex items-center justify-between"
          >
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-200">
                Netzwerk-Anfragen auslesen
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                API-Calls und HTTP-Requests der letzten Minuten
              </p>
            </div>
            <USwitch
              v-model="includeNetworkRequests"
              :disabled="isSubmitting"
            />
          </div>

          <!-- User Journey Toggle -->
          <div
            v-if="config?.enableUserJourney"
            class="flex items-center justify-between"
          >
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-200">
                User Journey auslesen
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Benutzer-Interaktionen und Navigation ({{ userJourneyEvents.length }} Events)
              </p>
            </div>
            <USwitch
              v-model="includeUserJourney"
              :disabled="isSubmitting"
            />
          </div>
        </div>
      </template>
    </UAccordion>

    <!-- User Journey Timeline Preview -->
    <div
      v-if="config?.enableUserJourney && includeUserJourney && userJourneyEvents.length > 0"
      class="space-y-2"
    >
      <label class="text-sm font-medium text-gray-700 dark:text-gray-200">
        User Journey Preview ({{ userJourneyEvents.length }} Events)
      </label>
      <UserJourneyTimeline :events="userJourneyEvents" />
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-end gap-3 pt-4">
      <UButton
        color="neutral"
        variant="outline"
        :disabled="isSubmitting"
        @click="$emit('cancel')"
      >
        Abbrechen
      </UButton>
      <UButton
        type="submit"
        loading-auto
        color="error"
        :loading="isSubmitting"
        :disabled="!state.title || !state.type || !state.description"
      >
        Senden
      </UButton>
    </div>
  </UForm>
</template>
