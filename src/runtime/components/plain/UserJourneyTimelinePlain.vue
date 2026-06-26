<script setup lang="ts">
import { computed, ref } from 'vue'
import type { UserInteractionEvent } from '../../types'

// Standalone (no @nuxt/ui) variant of UserJourneyTimeline for `ui: false` mode.

const props = defineProps<{
  events: UserInteractionEvent[]
}>()

const selectedEventType = ref<string>('all')

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

const eventTypeColors = computed<Record<string, string>>(() => ({
  click: '#3b82f6',
  error: '#ef4444',
  form_change: '#10b981',
  form_submit: '#10b981',
  hover: '#8b5cf6',
  input_change: '#f59e0b',
  keyboard: '#06b6d4',
  modal_close: '#ef4444',
  modal_open: '#06b6d4',
  navigation: '#06b6d4',
  scroll: '#6b7280',
}))

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

const getEventColor = (type: string): string => {
  return eventTypeColors.value[type] || '#6b7280'
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
  <div class="buglt-timeline">
    <!-- Filter -->
    <div class="buglt-timeline__filter">
      <select
        v-model="selectedEventType"
        class="buglt-select"
      >
        <option
          v-for="type in eventTypes"
          :key="type"
          :value="type"
        >
          {{ type === 'all' ? 'Alle Event-Typen' : formatEventType(type) }}
        </option>
      </select>
    </div>

    <!-- Timeline -->
    <div
      v-if="filteredEvents.length > 0"
      class="buglt-timeline__events"
    >
      <div
        v-for="(event, index) in filteredEvents"
        :key="index"
        class="buglt-timeline__event"
      >
        <!-- Color marker -->
        <div
          class="buglt-timeline__marker"
          :style="{ backgroundColor: getEventColor(event.type) }"
        />

        <!-- Content -->
        <div class="buglt-timeline__content">
          <div class="buglt-timeline__head">
            <span
              class="buglt-timeline__type"
              :style="{ color: getEventColor(event.type) }"
            >
              {{ formatEventType(event.type) }}
            </span>
            <span class="buglt-timeline__time">
              {{ formatTime(event.timestamp) }}
            </span>
          </div>

          <div class="buglt-timeline__target">
            {{ event.target }}
          </div>

          <div
            v-if="getEventMetadata(event)"
            class="buglt-timeline__meta"
          >
            {{ getEventMetadata(event) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="buglt-timeline__empty"
    >
      Keine User Journey Events aufgezeichnet
    </div>
  </div>
</template>

<style scoped>
.buglt-timeline {
  max-height: 400px;
  overflow-y: auto;
}

.buglt-timeline__filter {
  margin-bottom: 16px;
}

.buglt-select {
  width: 100%;
  padding: 6px 10px;
  font-size: 13px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #111827;
}

.buglt-timeline__events {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.buglt-timeline__event {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.buglt-timeline__marker {
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  border-radius: 9999px;
  margin-top: 5px;
}

.buglt-timeline__content {
  flex: 1;
  min-width: 0;
}

.buglt-timeline__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.buglt-timeline__type {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.buglt-timeline__time {
  font-size: 12px;
  color: #6b7280;
}

.buglt-timeline__target {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.buglt-timeline__meta {
  font-size: 12px;
  color: #4b5563;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.buglt-timeline__empty {
  text-align: center;
  padding: 32px 0;
  font-size: 14px;
  color: #6b7280;
}
</style>
