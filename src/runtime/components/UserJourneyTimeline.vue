<script setup lang="ts">
// ============================================================================
// Imports
// ============================================================================
import { computed, ref } from 'vue'
import type { UserInteractionEvent } from '../types'

// ============================================================================
// Props
// ============================================================================
const props = defineProps<{
  events: UserInteractionEvent[]
}>()

// ============================================================================
// Variables
// ============================================================================
const selectedEventType = ref<string>('all')

// ============================================================================
// Computed Properties
// ============================================================================
const eventTypes = computed<string[]>(() => {
  const types = new Set<string>(['all'])
  props.events.forEach(event => types.add(event.type))
  return Array.from(types)
})

const filteredEvents = computed<UserInteractionEvent[]>(() => {
  if (selectedEventType.value === 'all') {
    return props.events
  }
  return props.events.filter(event => event.type === selectedEventType.value)
})

const eventTypeColors = computed<Record<string, 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'>>(() => ({
  click: 'primary',
  error: 'error',
  form_change: 'success',
  form_submit: 'success',
  hover: 'secondary',
  input_change: 'warning',
  keyboard: 'info',
  modal_close: 'error',
  modal_open: 'info',
  navigation: 'info',
  scroll: 'neutral',
}))

const eventTypeIcons = computed<Record<string, string>>(() => ({
  click: 'i-heroicons-cursor-arrow-rays',
  error: 'i-heroicons-exclamation-circle',
  form_change: 'i-heroicons-document-text',
  form_submit: 'i-heroicons-paper-airplane',
  hover: 'i-heroicons-hand-raised',
  input_change: 'i-heroicons-pencil-square',
  keyboard: 'i-heroicons-command-line',
  modal_close: 'i-heroicons-x-mark',
  modal_open: 'i-heroicons-window',
  navigation: 'i-heroicons-arrow-right-circle',
  scroll: 'i-heroicons-arrows-up-down',
}))

// ============================================================================
// Functions
// ============================================================================
const formatTime = (timestamp: string): string => {
  const date: Date = new Date(timestamp)
  return date.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const formatEventType = (type: string): string => {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const getEventColor = (type: string): 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral' => {
  return eventTypeColors.value[type] || 'neutral'
}

const getEventIcon = (type: string): string => {
  return eventTypeIcons.value[type] || 'i-heroicons-information-circle'
}

const getEventMetadata = (event: UserInteractionEvent): string => {
  if (!event.metadata) return ''

  const parts: string[] = []

  if (event.metadata.text) {
    parts.push(`Text: ${event.metadata.text.substring(0, 30)}...`)
  }

  if (event.metadata.value) {
    parts.push(`Wert: ${event.metadata.value}`)
  }

  if (event.metadata.url) {
    parts.push(`URL: ${event.metadata.url}`)
  }

  if (event.metadata.toUrl) {
    parts.push(`→ ${event.metadata.toUrl}`)
  }

  if (event.metadata.scrollPosition !== undefined) {
    parts.push(`Position: ${event.metadata.scrollPosition}px`)
  }

  if (event.metadata.key) {
    parts.push(`Taste: ${event.metadata.key}`)
  }

  if (event.metadata.errorMessage) {
    parts.push(`Fehler: ${event.metadata.errorMessage}`)
  }

  return parts.join(' | ')
}
</script>

<template>
  <div class="user-journey-timeline">
    <!-- Filter -->
    <div class="mb-4">
      <USelect
        v-model="selectedEventType"
        :items="eventTypes.map(type => ({
          label: type === 'all' ? 'Alle Event-Typen' : formatEventType(type),
          value: type,
        }))"
        placeholder="Alle Event-Typen"
        size="sm"
      />
    </div>

    <!-- Timeline -->
    <div
      v-if="filteredEvents.length > 0"
      class="space-y-2"
    >
      <div
        v-for="(event, index) in filteredEvents"
        :key="index"
        class="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <!-- Icon -->
        <div class="flex-shrink-0 mt-0.5">
          <UIcon
            :name="getEventIcon(event.type)"
            :class="`text-${getEventColor(event.type)}-500`"
            class="w-5 h-5"
          />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2 mb-1">
            <UBadge
              :color="getEventColor(event.type)"
              variant="soft"
              size="xs"
            >
              {{ formatEventType(event.type) }}
            </UBadge>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ formatTime(event.timestamp) }}
            </span>
          </div>

          <div class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {{ event.target }}
          </div>

          <div
            v-if="getEventMetadata(event)"
            class="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate"
          >
            {{ getEventMetadata(event) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="text-center py-8 text-gray-500 dark:text-gray-400"
    >
      <UIcon
        name="i-heroicons-clock"
        class="w-12 h-12 mx-auto mb-2 opacity-50"
      />
      <p class="text-sm">
        Keine User Journey Events aufgezeichnet
      </p>
    </div>
  </div>
</template>

<style scoped>
.user-journey-timeline {
  max-height: 400px;
  overflow-y: auto;
}
</style>
