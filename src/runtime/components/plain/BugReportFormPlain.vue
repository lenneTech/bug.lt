<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRuntimeConfig } from '#imports'
import type { AttachmentFile, BugReportConfig, BugReportData, BugReportType } from '../../types'
import { getBrowserInfo } from '../../utils/browserInfo'
import { getConsoleLogs } from '../../utils/consoleLogs'
import { getNetworkRequests } from '../../utils/networkRequests'
import { useBugReport } from '../../composables/useBugReport.plain'
import AttachmentsListPlain from './AttachmentsListPlain.vue'
import UserJourneyTimelinePlain from './UserJourneyTimelinePlain.vue'

// Standalone (no @nuxt/ui) variant of BugReportForm for `ui: false` mode.

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

const attachments = ref<AttachmentFile[]>([])
const includeBrowserInfo = ref<boolean>(true)
const includeConsoleLogs = ref<boolean>(true)
const includeNetworkRequests = ref<boolean>(true)
const includeUserJourney = ref<boolean>(true)
const showAdditional = ref<boolean>(false)
const showJourneyPreview = ref<boolean>(false)

const userJourneyEvents = computed(() => getUserJourney())

// Watch for pre-captured screenshot changes
watch(previewScreenshot, (newScreenshot) => {
  if (newScreenshot && !attachments.value.some(a => a.isScreenshot)) {
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

const isValid = computed(() => !!state.title && !!state.type && !!state.description)

const onSubmit = async () => {
  if (!isValid.value) {
    return
  }

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

defineExpose({
  submit: onSubmit,
  isValid,
})
</script>

<template>
  <form
    class="buglt-form"
    @submit.prevent="onSubmit"
  >
    <!-- Title -->
    <div class="buglt-field">
      <label class="buglt-label">
        Titel <span class="buglt-required">*</span>
      </label>
      <input
        v-model="state.title"
        class="buglt-input"
        placeholder="Kurze Beschreibung des Problems"
        :disabled="isSubmitting"
      >
    </div>

    <!-- Type -->
    <div class="buglt-field">
      <label class="buglt-label">
        Typ <span class="buglt-required">*</span>
      </label>
      <select
        v-model="state.type"
        class="buglt-input"
        :disabled="isSubmitting"
      >
        <option
          value=""
          disabled
        >
          Typ auswählen
        </option>
        <option
          v-for="option in typeOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>

    <!-- Description -->
    <div class="buglt-field">
      <label class="buglt-label">
        Beschreibung <span class="buglt-required">*</span>
      </label>
      <textarea
        v-model="state.description"
        class="buglt-input buglt-textarea"
        placeholder="Was ist passiert..."
        rows="4"
        :disabled="isSubmitting"
      />
    </div>

    <!-- Expected Behavior -->
    <div class="buglt-field">
      <label class="buglt-label">Erwartetes Verhalten</label>
      <textarea
        v-model="state.expectedBehavior"
        class="buglt-input buglt-textarea"
        placeholder="Was hätten Sie erwartet?"
        rows="3"
        :disabled="isSubmitting"
      />
    </div>

    <!-- Steps to Reproduce -->
    <div class="buglt-field">
      <label class="buglt-label">Schritte zur Reproduktion</label>
      <textarea
        v-model="state.stepsToReproduce"
        class="buglt-input buglt-textarea"
        placeholder="1. Gehe zu... 2. Klicke auf... 3. Fehler erscheint"
        rows="3"
        :disabled="isSubmitting"
      />
    </div>

    <!-- Attachments Section -->
    <div class="buglt-field">
      <label class="buglt-label">
        Anhänge
        <span
          v-if="hasScreenshot"
          class="buglt-label__hint"
        >
          (Screenshot automatisch erfasst)
        </span>
      </label>

      <AttachmentsListPlain
        :attachments="attachments"
        :disabled="isSubmitting"
        @add="addAttachments"
        @remove="removeAttachment"
      />
    </div>

    <!-- Additional Data Toggle -->
    <div class="buglt-collapsible">
      <button
        type="button"
        class="buglt-collapsible__trigger"
        @click="showAdditional = !showAdditional"
      >
        <span>Zusätzliche Informationen</span>
        <svg
          class="buglt-collapsible__chevron"
          :class="{ 'buglt-collapsible__chevron--open': showAdditional }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <div
        v-if="showAdditional"
        class="buglt-collapsible__body"
      >
        <!-- Browser Info Toggle -->
        <label
          v-if="config?.enableBrowserInfo"
          class="buglt-toggle"
        >
          <span class="buglt-toggle__text">
            <span class="buglt-toggle__title">Browser-Informationen auslesen</span>
            <span class="buglt-toggle__desc">Browser, Betriebssystem, Bildschirmgröße, etc.</span>
          </span>
          <input
            v-model="includeBrowserInfo"
            type="checkbox"
            class="buglt-switch"
            :disabled="isSubmitting"
          >
        </label>

        <!-- Console Logs Toggle -->
        <label
          v-if="config?.enableConsoleLogs"
          class="buglt-toggle"
        >
          <span class="buglt-toggle__text">
            <span class="buglt-toggle__title">Konsolen-Logs auslesen</span>
            <span class="buglt-toggle__desc">Aktuelle Browser-Konsolennachrichten</span>
          </span>
          <input
            v-model="includeConsoleLogs"
            type="checkbox"
            class="buglt-switch"
            :disabled="isSubmitting"
          >
        </label>

        <!-- Network Requests Toggle -->
        <label
          v-if="config?.enableNetworkRequests"
          class="buglt-toggle"
        >
          <span class="buglt-toggle__text">
            <span class="buglt-toggle__title">Netzwerk-Anfragen auslesen</span>
            <span class="buglt-toggle__desc">API-Calls und HTTP-Requests der letzten Minuten</span>
          </span>
          <input
            v-model="includeNetworkRequests"
            type="checkbox"
            class="buglt-switch"
            :disabled="isSubmitting"
          >
        </label>

        <!-- User Journey Toggle -->
        <label
          v-if="config?.enableUserJourney"
          class="buglt-toggle"
        >
          <span class="buglt-toggle__text">
            <span class="buglt-toggle__title">User Journey auslesen</span>
            <span class="buglt-toggle__desc">Benutzer-Interaktionen und Navigation ({{ userJourneyEvents.length }} Events)</span>
          </span>
          <input
            v-model="includeUserJourney"
            type="checkbox"
            class="buglt-switch"
            :disabled="isSubmitting"
          >
        </label>
      </div>
    </div>

    <!-- User Journey Timeline Preview -->
    <div
      v-if="config?.enableUserJourney && includeUserJourney && userJourneyEvents.length > 0"
      class="buglt-collapsible"
    >
      <button
        type="button"
        class="buglt-collapsible__trigger"
        @click="showJourneyPreview = !showJourneyPreview"
      >
        <span>User Journey Preview ({{ userJourneyEvents.length }} Events)</span>
        <svg
          class="buglt-collapsible__chevron"
          :class="{ 'buglt-collapsible__chevron--open': showJourneyPreview }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <div
        v-if="showJourneyPreview"
        class="buglt-collapsible__body"
      >
        <UserJourneyTimelinePlain :events="userJourneyEvents" />
      </div>
    </div>
  </form>
</template>

<style scoped>
.buglt-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.buglt-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.buglt-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.buglt-label__hint {
  font-size: 12px;
  font-weight: 400;
  color: #6b7280;
  margin-left: 8px;
}

.buglt-required {
  color: #dc2626;
}

.buglt-input {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 12px;
  font-size: 14px;
  font-family: inherit;
  color: #111827;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  outline: none;
  transition: border-color .15s ease, box-shadow .15s ease;
}

.buglt-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, .25);
}

.buglt-input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.buglt-textarea {
  resize: vertical;
  min-height: 64px;
}

.buglt-collapsible {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.buglt-collapsible__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  background: #f9fafb;
  border: none;
  cursor: pointer;
}

.buglt-collapsible__trigger:hover {
  background: #f3f4f6;
}

.buglt-collapsible__chevron {
  width: 18px;
  height: 18px;
  transition: transform .2s ease;
}

.buglt-collapsible__chevron--open {
  transform: rotate(180deg);
}

.buglt-collapsible__body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
}

.buglt-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
}

.buglt-toggle__text {
  display: flex;
  flex-direction: column;
}

.buglt-toggle__title {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.buglt-toggle__desc {
  font-size: 12px;
  color: #6b7280;
}

.buglt-switch {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  accent-color: #ef4444;
  cursor: pointer;
}
</style>
