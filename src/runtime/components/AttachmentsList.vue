<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AttachmentFile } from '../types'

interface Props {
  attachments: AttachmentFile[]
  disabled?: boolean
  maxFileSize?: number // in MB
  allowedTypes?: string[]
}

interface Emits {
  (e: 'add', files: AttachmentFile[]): void

  (e: 'remove', id: string): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  maxFileSize: 10,
  allowedTypes: () => ['image/*', '.pdf', '.doc', '.docx', '.txt', '.log'],
})

const emit = defineEmits<Emits>()

const fileInput = ref<HTMLInputElement>()
const dragOver = ref<boolean>(false)
const acceptTypes = computed(() => props.allowedTypes.join(','))

const formatFileSize = (bytes: number) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

const generateId = () => Math.random().toString(36).substr(2, 9)

const uploadAreaClasses = computed(() => [
  'border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer text-center',
  {
    'border-primary-500 bg-primary-50': dragOver.value && !props.disabled,
    'border-gray-300': !dragOver.value || props.disabled,
    'opacity-50 cursor-not-allowed': props.disabled,
    'hover:border-gray-400': !props.disabled,
  },
])

const processFiles = async (fileList: FileList) => {
  const newAttachments: AttachmentFile[] = []

  for (const file of Array.from(fileList)) {
    if (file.size > props.maxFileSize * 1024 * 1024) {
      console.warn(`File ${file.name} is too large (${formatFileSize(file.size)}). Maximum size is ${props.maxFileSize}MB.`)
      continue
    }

    // Convert file to data URL for consistent handling
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target?.result as string)
      reader.readAsDataURL(file)
    })

    const attachment: AttachmentFile = {
      id: generateId(),
      name: file.name,
      type: file.type,
      size: file.size,
      data: dataUrl,
    }

    // Generate preview for images
    if (file.type.startsWith('image/')) {
      attachment.preview = dataUrl
    }

    newAttachments.push(attachment)
  }

  if (newAttachments.length > 0) {
    emit('add', newAttachments)
  }
}

const onFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    processFiles(input.files)
    input.value = ''
  }
}

const onDrop = (event: DragEvent) => {
  event.preventDefault()
  dragOver.value = false

  if (props.disabled) return

  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    processFiles(files)
  }
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  dragOver.value = true
}

const onDragLeave = () => {
  dragOver.value = false
}

const openFileDialog = () => {
  if (!props.disabled) {
    fileInput.value?.click()
  }
}

const removeAttachment = (id: string) => {
  emit('remove', id)
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return 'i-heroicons-photo'
  if (type.includes('pdf')) return 'i-heroicons-document-text'
  if (type.includes('doc')) return 'i-heroicons-document'
  if (type.includes('text') || type.includes('log')) return 'i-heroicons-document-text'
  return 'i-heroicons-paper-clip'
}
</script>

<template>
  <div class="space-y-3">
    <!-- File Upload Area -->
    <div
      :class="uploadAreaClasses"
      @drop="onDrop"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @click="openFileDialog"
    >
      <input
        ref="fileInput"
        type="file"
        multiple
        :accept="acceptTypes"
        :disabled="disabled"
        class="hidden"
        @change="onFileSelect"
      >

      <UIcon
        name="i-heroicons-cloud-arrow-up"
        class="mx-auto text-3xl text-gray-400 mb-2"
      />
      <div class="text-sm text-gray-600">
        <span class="font-medium text-blue-600">Dateien hochladen</span>
        oder hier hineinziehen
      </div>
      <div class="text-xs text-gray-500 mt-1">
        Max. {{ maxFileSize }}MB pro Datei
      </div>
    </div>

    <!-- Attachments List -->
    <div
      v-if="attachments.length > 0"
      class="space-y-2"
    >
      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-200">
        Anhänge ({{ attachments.length }})
      </h4>

      <div class="space-y-1">
        <div
          v-for="attachment in attachments"
          :key="attachment.id"
          class="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg group"
        >
          <!-- Preview/Icon -->
          <div class="flex-shrink-0">
            <img
              v-if="attachment.preview || attachment.isScreenshot"
              :src="attachment.preview || (typeof attachment.data === 'string' ? attachment.data : '')"
              :alt="attachment.name"
              class="w-8 h-8 object-cover rounded"
            >
            <UIcon
              v-else
              :name="getFileIcon(attachment.type)"
              class="w-8 h-8 text-gray-400"
            />
          </div>

          <!-- File Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium truncate">
                {{ attachment.name }}
              </span>
              <UBadge
                v-if="attachment.isScreenshot"
                size="xs"
                color="info"
                variant="soft"
              >
                Screenshot
              </UBadge>
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              {{ formatFileSize(attachment.size) }}
            </div>
          </div>

          <!-- Remove Button -->
          <UButton
            color="error"
            variant="ghost"
            size="sm"
            icon="i-heroicons-x-mark"
            class="cursor-pointer"
            :disabled="disabled"
            @click.stop="removeAttachment(attachment.id)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
