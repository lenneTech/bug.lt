<script setup>
import { computed, reactive, ref, watch } from "vue";
import { z } from "zod";
import { captureScreenshot as captureScreenshotUtil } from "../utils/screenshot";
import { getBrowserInfo } from "../utils/browserInfo";
import { getConsoleLogs } from "../utils/consoleLogs";
import { useBugReport } from "../composables/useBugReport";
import AttachmentsList from "./AttachmentsList.vue";
defineProps({
  isSubmitting: { type: Boolean, required: false, default: false }
});
const emit = defineEmits(["submit", "cancel"]);
const runtimeConfig = useRuntimeConfig();
const { previewScreenshot, capturingScreenshot } = useBugReport();
const config = computed(() => runtimeConfig.public.bugLt);
const schema = z.object({
  title: z.string().min(1, "Titel ist erforderlich"),
  type: z.enum(["bug", "feature", "enhancement", "other"]),
  description: z.string().min(1, "Beschreibung ist erforderlich"),
  expectedBehavior: z.string().optional(),
  stepsToReproduce: z.string().optional()
});
const state = reactive({
  title: "",
  type: "",
  description: "",
  expectedBehavior: "",
  stepsToReproduce: ""
});
const typeOptions = [
  { label: "Bug", value: "bug" },
  { label: "Feature", value: "feature" },
  { label: "Verbesserung", value: "enhancement" },
  { label: "Sonstiges", value: "other" }
];
const accordionItems = [
  {
    label: "Zus\xE4tzliche Informationen",
    icon: "i-heroicons-information-circle",
    content: "Browser-Informationen und Konsolen-Logs"
  }
];
const attachments = ref([]);
const localCapturingScreenshot = ref(false);
const includeBrowserInfo = ref(true);
const includeConsoleLogs = ref(true);
watch(previewScreenshot, (newScreenshot) => {
  if (newScreenshot && !attachments.value.some((a) => a.isScreenshot)) {
    const screenshotSize = Math.round((newScreenshot.length - "data:image/png;base64,".length) * 0.75);
    const screenshotAttachment = {
      id: "screenshot-" + Date.now(),
      name: "screenshot.png",
      type: "image/png",
      size: screenshotSize,
      data: newScreenshot,
      isScreenshot: true,
      preview: newScreenshot
    };
    attachments.value.unshift(screenshotAttachment);
  }
}, { immediate: true });
const captureScreenshot = async () => {
  localCapturingScreenshot.value = true;
  try {
    const screenshot = await captureScreenshotUtil();
    if (screenshot) {
      attachments.value = attachments.value.filter((a) => !a.isScreenshot);
      const screenshotSize = Math.round((screenshot.length - "data:image/png;base64,".length) * 0.75);
      const screenshotAttachment = {
        id: "screenshot-" + Date.now(),
        name: "screenshot.png",
        type: "image/png",
        size: screenshotSize,
        data: screenshot,
        isScreenshot: true,
        preview: screenshot
      };
      attachments.value.unshift(screenshotAttachment);
    }
  } catch (error) {
    console.error("Failed to capture screenshot:", error);
  } finally {
    localCapturingScreenshot.value = false;
  }
};
const addAttachments = (newAttachments) => {
  attachments.value.push(...newAttachments);
};
const removeAttachment = (id) => {
  attachments.value = attachments.value.filter((a) => a.id !== id);
};
const hasScreenshot = computed(() => attachments.value.some((a) => a.isScreenshot));
const onSubmit = async () => {
  const serializedAttachments = attachments.value.map((attachment) => ({
    id: attachment.id,
    name: attachment.name,
    type: attachment.type,
    size: attachment.size,
    data: attachment.data,
    isScreenshot: attachment.isScreenshot,
    preview: attachment.preview
  }));
  const data = {
    title: state.title,
    type: state.type,
    description: state.description,
    expectedBehavior: state.expectedBehavior || void 0,
    stepsToReproduce: state.stepsToReproduce || void 0,
    screenshot: attachments.value.find((a) => a.isScreenshot)?.data,
    attachments: serializedAttachments
  };
  if (includeBrowserInfo.value && config.value?.enableBrowserInfo) {
    data.browserInfo = getBrowserInfo();
  }
  if (includeConsoleLogs.value && config.value?.enableConsoleLogs) {
    data.consoleLogs = getConsoleLogs(config.value?.maxConsoleLogs);
  }
  emit("submit", data);
};
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
      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-200">
          Anhänge
        </label>
        <UButton
          v-if="config?.enableScreenshot"
          color="neutral"
          variant="outline"
          size="sm"
          icon="i-heroicons-camera"
          :loading="localCapturingScreenshot || capturingScreenshot"
          :disabled="isSubmitting"
          @click="captureScreenshot"
        >
          {{
            localCapturingScreenshot || capturingScreenshot ? "Wird erfasst..." : hasScreenshot ? "Neu erfassen" : "Screenshot erfassen"
          }}
        </UButton>
      </div>

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
        </div>
      </template>
    </UAccordion>

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
