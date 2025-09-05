<script setup>
import { computed } from "vue";
import { useBugReport } from "../composables/useBugReport";
import iconPng from "../public/icon.png";
const props = defineProps({
  position: { type: String, required: false, default: void 0 },
  color: { type: String, required: false, default: void 0 },
  text: { type: String, required: false, default: void 0 },
  icon: { type: String, required: false, default: void 0 },
  show: { type: Boolean, required: false, default: void 0 }
});
const { openModal, capturingScreenshot } = useBugReport();
const runtimeConfig = useRuntimeConfig();
const bugConfig = runtimeConfig.public.bugLt;
const handleOpenModal = async () => {
  await openModal();
};
const config = computed(() => ({
  autoShow: props.show ?? bugConfig?.autoShow,
  position: props.position ?? bugConfig?.position,
  buttonColor: props.color ?? bugConfig?.buttonColor,
  buttonText: props.text ?? bugConfig?.buttonText,
  buttonIcon: props.icon ?? bugConfig?.buttonIcon
}));
const buttonClasses = computed(() => {
  const baseClasses = "fixed z-[9999] cursor-pointer shadow-lg flex gap-3 hover:shadow-xl transition-all duration-200 rounded-full";
  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4"
  };
  return [
    baseClasses,
    positionClasses[config.value.position]
  ].join(" ");
});
</script>

<template>
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
        {{ capturingScreenshot ? "Screenshot..." : config.buttonText }}
      </div>
    </UButton>
  </Teleport>
</template>
