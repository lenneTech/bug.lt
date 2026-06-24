<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AttachmentFile } from '../../types'

// Standalone (no @nuxt/ui) variant of AttachmentsList for `ui: false` mode.

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

const generateId = () => Math.random().toString(36).slice(2, 11)

const processFiles = async (fileList: FileList) => {
  const newAttachments: AttachmentFile[] = []

  for (const file of Array.from(fileList)) {
    if (file.size > props.maxFileSize * 1024 * 1024) {
      console.warn(`File ${file.name} is too large (${formatFileSize(file.size)}). Maximum size is ${props.maxFileSize}MB.`)
      continue
    }

    let dataUrl: string
    try {
      dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = e => resolve(e.target?.result as string)
        // Without these the promise would hang on a read failure and block
        // any further uploads. Reject so we can skip the offending file.
        reader.onerror = () => reject(reader.error ?? new Error('FileReader error'))
        reader.onabort = () => reject(new Error('FileReader aborted'))
        reader.readAsDataURL(file)
      })
    }
    catch (error) {
      console.warn(`Failed to read file ${file.name}:`, error)
      continue
    }

    const attachment: AttachmentFile = {
      id: generateId(),
      name: file.name,
      type: file.type,
      size: file.size,
      data: dataUrl,
    }

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
</script>

<template>
  <div class="buglt-attachments">
    <!-- File Upload Area -->
    <div
      class="buglt-dropzone"
      :class="{ 'buglt-dropzone--over': dragOver && !disabled, 'buglt-dropzone--disabled': disabled }"
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
        class="buglt-hidden"
        @change="onFileSelect"
      >

      <svg
        class="buglt-dropzone__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M3 16.5V18a2 2 0 002 2h14a2 2 0 002-2v-1.5M12 4v12m0-12l-4 4m4-4l4 4"
        />
      </svg>
      <div class="buglt-dropzone__text">
        <span class="buglt-dropzone__link">Dateien hochladen</span>
        oder hier hineinziehen
      </div>
      <div class="buglt-dropzone__hint">
        Max. {{ maxFileSize }}MB pro Datei
      </div>
    </div>

    <!-- Attachments List -->
    <div
      v-if="attachments.length > 0"
      class="buglt-attachments__list"
    >
      <h4 class="buglt-attachments__title">
        Anhänge ({{ attachments.length }})
      </h4>

      <div class="buglt-attachments__items">
        <div
          v-for="attachment in attachments"
          :key="attachment.id"
          class="buglt-attachment"
        >
          <!-- Preview/Icon -->
          <div class="buglt-attachment__preview">
            <img
              v-if="attachment.preview || attachment.isScreenshot"
              :src="attachment.preview || (typeof attachment.data === 'string' ? attachment.data : '')"
              :alt="attachment.name"
              class="buglt-attachment__img"
            >
            <svg
              v-else
              class="buglt-attachment__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75M18 6.75V3.375A1.125 1.125 0 0016.875 2.25h-3.75M18 6.75h-3.375A1.125 1.125 0 0113.5 5.625V2.25"
              />
            </svg>
          </div>

          <!-- File Info -->
          <div class="buglt-attachment__info">
            <div class="buglt-attachment__name-row">
              <span class="buglt-attachment__name">
                {{ attachment.name }}
              </span>
              <span
                v-if="attachment.isScreenshot"
                class="buglt-badge"
              >
                Screenshot
              </span>
            </div>
            <div class="buglt-attachment__size">
              {{ formatFileSize(attachment.size) }}
            </div>
          </div>

          <!-- Remove Button -->
          <button
            type="button"
            class="buglt-attachment__remove"
            :disabled="disabled"
            aria-label="Anhang entfernen"
            @click.stop="removeAttachment(attachment.id)"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.buglt-attachments {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.buglt-hidden {
  display: none;
}

.buglt-dropzone {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: border-color .15s ease, background-color .15s ease;
}

.buglt-dropzone:hover {
  border-color: #9ca3af;
}

.buglt-dropzone--over {
  border-color: #3b82f6;
  background: #eff6ff;
}

.buglt-dropzone--disabled {
  opacity: .5;
  cursor: not-allowed;
}

.buglt-dropzone__icon {
  width: 32px;
  height: 32px;
  margin: 0 auto 8px;
  color: #9ca3af;
}

.buglt-dropzone__text {
  font-size: 14px;
  color: #4b5563;
}

.buglt-dropzone__link {
  font-weight: 600;
  color: #2563eb;
}

.buglt-dropzone__hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.buglt-attachments__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.buglt-attachments__title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.buglt-attachments__items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.buglt-attachment {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: #f9fafb;
  border-radius: 8px;
}

.buglt-attachment__preview {
  flex-shrink: 0;
}

.buglt-attachment__img {
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: 4px;
}

.buglt-attachment__icon {
  width: 32px;
  height: 32px;
  color: #9ca3af;
}

.buglt-attachment__info {
  flex: 1;
  min-width: 0;
}

.buglt-attachment__name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.buglt-attachment__name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.buglt-badge {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 500;
  padding: 1px 6px;
  border-radius: 9999px;
  background: #dbeafe;
  color: #1d4ed8;
}

.buglt-attachment__size {
  font-size: 12px;
  color: #6b7280;
}

.buglt-attachment__remove {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #dc2626;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color .15s ease;
}

.buglt-attachment__remove:hover:not(:disabled) {
  background: #fee2e2;
}

.buglt-attachment__remove:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.buglt-attachment__remove svg {
  width: 16px;
  height: 16px;
}
</style>
