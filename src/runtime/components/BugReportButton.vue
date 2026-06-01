<script setup lang="ts">
import { computed } from 'vue'
import { useBugReport } from '../composables/useBugReport'
import { captureScreenshot } from '../utils/screenshot'
import type { BugReportConfig } from '~/src/runtime/types'
import iconPng from '../public/icon.png'
import { useRuntimeConfig } from '#imports'

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

  // Now open the modal with the captured screenshot
  await openModal()
}

const config = computed(() => ({
  autoShow: props.show ?? bugConfig?.autoShow,
  position: props.position ?? bugConfig?.position,
  buttonColor: props.color ?? bugConfig?.buttonColor,
  buttonText: props.text ?? bugConfig?.buttonText,
  buttonIcon: props.icon ?? bugConfig?.buttonIcon,
}))

const buttonClasses = computed(() => {
  const baseClasses = '!border-none !ring-0 fixed z-[9999] cursor-pointer shadow-lg flex gap-3 hover:shadow-xl transition-all duration-200 rounded-full'

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  }

  return [
    baseClasses,
    positionClasses[config.value.position],
  ].join(' ')
})
</script>

<template>
  <!--
    Client-only on purpose: this floating button is a pure client-side UI overlay.
    Nuxt UI's UButton resolves to a NuxtLink with `to=undefined`, which renders an
    `<a>` during SSR but mismatches on hydration -> "Failed to resolve component:
    RouterLink" + hydration-mismatch warnings on every page. Rendering it only on
    the client avoids the SSR/hydration mismatch entirely.
  -->
  <ClientOnly>
    <Teleport to="body">
      <UButton
        v-if="config.autoShow"
        :class="buttonClasses"
        :style="`background-color: ${config.buttonColor}; color: white;`"
        size="lg"
        variant="solid"
        :loading="capturingScreenshot"
        @click="handleOpenModal"
      >
        <img
          v-if="!config.buttonIcon && !config.buttonText"
          :src="iconPng"
          class="w-7 h-7 p-1"
          alt="Bug Report"
        >
        <UIcon
          v-else-if="config.buttonIcon"
          :name="config.buttonIcon"
          class="w-6 h-6"
        />
        <div v-if="config.buttonText">
          {{ capturingScreenshot ? 'Screenshot...' : config.buttonText }}
        </div>
      </UButton>
    </Teleport>
  </ClientOnly>
</template>
