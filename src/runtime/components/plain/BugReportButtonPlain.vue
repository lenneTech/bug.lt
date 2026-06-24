<script setup lang="ts">
import { computed } from 'vue'
import { useBugReport } from '../../composables/useBugReport.plain'
import { captureScreenshot } from '../../utils/screenshot'
import type { BugReportConfig } from '../../types'
// @ts-expect-error - PNG asset import is resolved by the consumer's Vite build,
// not by vue-tsc (no global asset type shim in this package).
import iconPng from '../../public/icon.png'
import { useRuntimeConfig } from '#imports'

// Standalone (no @nuxt/ui) variant of BugReportButton for `ui: false` mode.
// Renders a plain <button> (no NuxtLink/UButton), so there is no SSR/hydration
// mismatch and no Teleport/ClientOnly dependency required.

interface Props {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  color?: string
  text?: string
  icon?: string
  show?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  position: undefined,
  color: undefined,
  text: undefined,
  icon: undefined,
  show: undefined,
})

const { openModal, capturingScreenshot, previewScreenshot } = useBugReport()
const runtimeConfig = useRuntimeConfig()
const bugConfig: BugReportConfig = runtimeConfig.public.bugLt as BugReportConfig

const handleOpenModal = async (): Promise<void> => {
  // Capture screenshot BEFORE opening modal (captures current state)
  capturingScreenshot.value = true
  try {
    const screenshot: string = await captureScreenshot()
    previewScreenshot.value = screenshot
  }
  catch (error) {
    console.error('Failed to capture screenshot:', error)
    previewScreenshot.value = null
  }
  finally {
    capturingScreenshot.value = false
  }

  await openModal()
}

const config = computed(() => ({
  autoShow: props.show ?? bugConfig?.autoShow,
  position: (props.position ?? bugConfig?.position ?? 'bottom-right') as NonNullable<Props['position']>,
  buttonColor: props.color ?? bugConfig?.buttonColor ?? '#ef4444',
  buttonText: props.text ?? bugConfig?.buttonText,
  buttonIcon: props.icon ?? bugConfig?.buttonIcon,
}))

const positionStyle = computed(() => {
  switch (config.value.position) {
    case 'bottom-left':
      return { bottom: '16px', left: '16px' }
    case 'top-right':
      return { top: '16px', right: '16px' }
    case 'top-left':
      return { top: '16px', left: '16px' }
    default:
      return { bottom: '16px', right: '16px' }
  }
})
</script>

<template>
  <button
    v-if="config.autoShow"
    type="button"
    class="buglt-fab"
    :class="{ 'buglt-fab--icon': !config.buttonText }"
    :style="{ backgroundColor: config.buttonColor, ...positionStyle }"
    :disabled="capturingScreenshot"
    aria-label="Fehler melden"
    @click="handleOpenModal"
  >
    <span
      v-if="capturingScreenshot"
      class="buglt-fab__spinner"
    />
    <img
      v-else-if="!config.buttonText"
      :src="iconPng"
      class="buglt-fab__img"
      alt=""
      aria-hidden="true"
    >
    <span v-if="config.buttonText">
      {{ capturingScreenshot ? 'Screenshot...' : config.buttonText }}
    </span>
  </button>
</template>

<style scoped>
.buglt-fab {
  position: fixed;
  z-index: 9999;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 20px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  border: none;
  border-radius: 9999px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, .2);
  cursor: pointer;
  transition: box-shadow .2s ease, transform .2s ease;
}

/* Icon-only mode: a perfectly round button. */
.buglt-fab--icon {
  width: 60px;
  height: 60px;
  padding: 0;
}

.buglt-fab:hover:not(:disabled) {
  box-shadow: 0 8px 20px rgba(0, 0, 0, .28);
}

.buglt-fab:disabled {
  cursor: progress;
}

.buglt-fab__img {
  width: 38px;
  height: 38px;
  object-fit: contain;
}

.buglt-fab__spinner {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(255, 255, 255, .5);
  border-top-color: #fff;
  border-radius: 9999px;
  animation: buglt-fab-spin .6s linear infinite;
}

@keyframes buglt-fab-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
