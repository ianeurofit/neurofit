<script setup lang="ts">
import type { SectionSummary } from '#shared/types/assessment'

const props = defineProps<{
  sections: SectionSummary[]
  pending: boolean
  error: boolean
  editable: boolean
}>()

const emit = defineEmits<{
  add: []
  edit: [section: SectionSummary]
  remove: [section: SectionSummary]
  move: [from: number, to: number]
  retry: []
}>()

const { t, locale } = useI18n()

const state = computed(() => resolveListState({
  pending: props.pending,
  error: props.error,
  count: props.sections.length,
  hasFilters: false,
}))

// Desktop drag and drop (native HTML5, no dependency). The arrows do the same with the keyboard or on touch.
const dragFrom = ref<number | null>(null)
const dragOver = ref<number | null>(null)

function onDragStart(index: number, event: DragEvent) {
  if (!props.editable) return
  dragFrom.value = index
  event.dataTransfer?.setData('text/plain', String(index))
}

function onDrop(index: number) {
  if (dragFrom.value !== null && dragFrom.value !== index) emit('move', dragFrom.value, index)
  dragFrom.value = null
  dragOver.value = null
}

function onDragEnd() {
  dragFrom.value = null
  dragOver.value = null
}
</script>

<template>
  <section class="rounded-2xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-ink-900">
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-4 py-4 sm:px-6 dark:border-white/10">
      <h3 class="font-bold">
        {{ t('tests.sections.title') }}
      </h3>
      <UButton
        v-if="editable && state === 'ready'"
        data-test="add"
        size="sm"
        icon="i-lucide-plus"
        :label="t('tests.sections.add')"
        @click="emit('add')"
      />
    </div>

    <div
      v-if="state === 'loading'"
      class="space-y-3 px-4 py-6 sm:px-6"
      role="status"
      :aria-label="t('dashboard.loading')"
    >
      <USkeleton
        v-for="n in 3"
        :key="n"
        class="h-16 w-full rounded-xl"
      />
    </div>

    <div
      v-else-if="state === 'error'"
      class="px-4 py-6 sm:px-6"
    >
      <UAlert
        role="alert"
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        :title="t('tests.sections.error')"
        :actions="[{ label: t('tests.sections.retry'), color: 'error', variant: 'outline', onClick: () => emit('retry') }]"
      />
    </div>

    <ol
      v-else-if="state === 'ready'"
      class="divide-y divide-neutral-200 dark:divide-white/10"
    >
      <li
        v-for="(section, index) in sections"
        :key="section.id"
        data-test="section"
        :draggable="editable ? 'true' : 'false'"
        class="flex items-center gap-3 px-4 py-4 transition-colors sm:px-6"
        :class="{
          'opacity-50': dragFrom === index,
          'bg-brand-50 dark:bg-white/5': dragOver === index && dragFrom !== index,
        }"
        @dragstart="onDragStart(index, $event)"
        @dragover.prevent="dragOver = index"
        @dragleave="dragOver = null"
        @drop.prevent="onDrop(index)"
        @dragend="onDragEnd"
      >
        <UIcon
          v-if="editable"
          name="i-lucide-grip-vertical"
          class="hidden size-5 shrink-0 cursor-grab text-neutral-400 sm:block"
          :aria-label="t('tests.sections.dragHandle')"
        />
        <span
          class="flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-bold dark:bg-white/10"
          :aria-label="t('tests.sections.position', { position: section.position })"
        >{{ section.position }}</span>

        <div class="min-w-0 flex-1">
          <p class="font-mono text-xs font-semibold break-all text-neutral-500 dark:text-neutral-400">
            {{ section.code }}
          </p>
          <p class="text-sm font-medium break-words">
            {{ localizedText(section.title, locale) }}
          </p>
          <p class="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            {{ t('tests.sections.domain', { domain: section.domain }) }} ·
            {{ t('tests.sections.questions', section.question_count) }}
          </p>
        </div>

        <div
          v-if="editable"
          class="flex shrink-0 flex-wrap items-center justify-end gap-1"
        >
          <UButton
            data-test="move-up"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-arrow-up"
            :aria-label="t('tests.sections.moveUp')"
            :disabled="index === 0"
            @click="emit('move', index, index - 1)"
          />
          <UButton
            data-test="move-down"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-arrow-down"
            :aria-label="t('tests.sections.moveDown')"
            :disabled="index === sections.length - 1"
            @click="emit('move', index, index + 1)"
          />
          <UButton
            data-test="edit"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-pencil"
            :aria-label="t('tests.sections.edit')"
            @click="emit('edit', section)"
          />
          <UButton
            data-test="delete"
            color="error"
            variant="ghost"
            size="sm"
            icon="i-lucide-trash-2"
            :aria-label="t('tests.sections.delete')"
            @click="emit('remove', section)"
          />
        </div>
      </li>
    </ol>

    <div
      v-else
      data-test="empty"
      class="px-4 py-10 text-center sm:px-6"
    >
      <UIcon
        name="i-lucide-layers"
        class="mx-auto size-8 text-neutral-400"
      />
      <p class="mt-3 text-sm font-medium">
        {{ t('tests.sections.empty') }}
      </p>
      <UButton
        v-if="editable"
        class="mt-4"
        icon="i-lucide-plus"
        :label="t('tests.sections.add')"
        @click="emit('add')"
      />
    </div>
  </section>
</template>
