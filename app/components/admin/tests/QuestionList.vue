<script setup lang="ts">
import type { Condition, QuestionDetail } from '#shared/types/assessment'

// HU006: the questions of one section with the actions of each row — edit, duplicate,
// activate/deactivate and move (drag on desktop, arrows everywhere for keyboard and touch).

const props = defineProps<{
  questions: QuestionDetail[]
  editable: boolean
  pending: boolean
  error: boolean
}>()

const emit = defineEmits<{
  edit: [question: QuestionDetail]
  duplicate: [question: QuestionDetail]
  toggle: [question: QuestionDetail]
  move: [from: number, to: number]
  retry: []
}>()

const { t, locale } = useI18n()

const state = computed(() => resolveListState({
  pending: props.pending,
  error: props.error,
  count: props.questions.length,
  hasFilters: false,
}))

const sorted = computed(() => [...props.questions].sort((a, b) => a.position - b.position))

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

function label(value: unknown) {
  return value && typeof value === 'object' ? localizedText(value as { es: string }, locale.value) : ''
}

/** A short line that shows how each type is configured. */
function summary(question: QuestionDetail) {
  const config = question.config
  switch (question.type) {
    case 'single_choice':
    case 'multiple_choice':
      return question.options.map(option => label(option.label)).join(' · ')
    case 'true_false': {
      const labels = (config.labels ?? {}) as Record<string, unknown>
      return `${label(labels.true)} / ${label(labels.false)}`
    }
    case 'numeric_scale':
      return [label(config.minLabel), `${config.min} – ${config.max}`, label(config.maxLabel)].filter(Boolean).join(' · ')
    case 'agreement':
      return ((config.labels ?? []) as unknown[]).map(label).join(' · ')
    case 'numeric_free':
      return [
        config.min !== undefined || config.max !== undefined ? `${config.min ?? '…'} – ${config.max ?? '…'}` : '',
        label(config.unit),
      ].filter(Boolean).join(' ')
    case 'open_text':
      return `${t('tests.questions.config.maxLength')}: ${config.maxLength}`
    default:
      return ''
  }
}

function conditionValue(value: unknown): string {
  if (Array.isArray(value)) return value.map(conditionValue).join(', ')
  if (value === true) return t('tests.questions.condition.yes')
  if (value === false) return t('tests.questions.condition.no')
  return String(value)
}

function conditionText(condition: Condition) {
  return t('tests.questions.condition.summary', {
    code: condition.questionCode,
    op: t(`tests.questions.condition.ops.${condition.op}`),
    value: conditionValue(condition.value),
  })
}
</script>

<template>
  <div>
    <div
      v-if="state === 'loading'"
      data-test="questions-loading"
      role="status"
      class="space-y-3"
      :aria-label="t('tests.questions.loading')"
    >
      <USkeleton
        v-for="n in 2"
        :key="n"
        class="h-20 w-full rounded-xl"
      />
    </div>

    <UAlert
      v-else-if="state === 'error'"
      role="alert"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      :title="t('tests.questions.error')"
      :actions="[{ label: t('tests.questions.retry'), color: 'error', variant: 'outline', onClick: () => emit('retry') }]"
    />

    <p
      v-else-if="state === 'empty'"
      data-test="questions-empty"
      class="rounded-xl border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-500 dark:border-white/15 dark:text-neutral-400"
    >
      {{ t('tests.questions.empty') }}
    </p>

    <ol
      v-else
      class="space-y-3"
    >
      <li
        v-for="(question, index) in sorted"
        :key="question.id"
        data-test="question"
        :draggable="editable ? 'true' : 'false'"
        class="rounded-xl border p-4 transition-colors"
        :class="[
          dragOver === index ? 'border-primary bg-primary/5' : 'border-neutral-200 dark:border-white/10',
          question.active ? '' : 'bg-neutral-50 dark:bg-white/[0.03]',
        ]"
        @dragstart="onDragStart(index, $event)"
        @dragover.prevent="editable && (dragOver = index)"
        @dragleave="dragOver = null"
        @drop.prevent="onDrop(index)"
        @dragend="onDragEnd"
      >
        <div class="flex flex-wrap items-start gap-3">
          <UIcon
            v-if="editable"
            name="i-lucide-grip-vertical"
            class="mt-1 hidden size-5 shrink-0 cursor-grab text-neutral-400 sm:block"
            :aria-label="t('tests.questions.actions.dragHandle')"
          />
          <div
            class="min-w-0 flex-1 space-y-2"
            :class="question.active ? '' : 'opacity-70'"
          >
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-mono text-xs break-all text-neutral-500 dark:text-neutral-400">{{ question.code }}</span>
              <UBadge
                variant="soft"
                color="primary"
                class="rounded-full"
                :label="t(`tests.questions.types.${question.type}`)"
              />
              <UBadge
                variant="soft"
                :color="question.required ? 'warning' : 'neutral'"
                class="rounded-full"
                :label="question.required ? t('tests.questions.required') : t('tests.questions.optional')"
              />
              <UBadge
                v-if="!question.active"
                data-test="inactive"
                variant="outline"
                color="neutral"
                class="rounded-full"
                icon="i-lucide-eye-off"
                :label="t('tests.questions.actions.inactive')"
              />
            </div>
            <p class="font-medium break-words">
              {{ localizedText(question.prompt, locale) }}
            </p>
            <p
              v-if="summary(question)"
              class="text-sm break-words text-neutral-600 dark:text-neutral-300"
            >
              {{ summary(question) }}
            </p>
            <p
              v-if="question.depends_on"
              data-test="condition"
              class="flex items-start gap-1.5 text-xs break-words text-neutral-600 dark:text-neutral-300"
            >
              <UIcon
                name="i-lucide-git-branch"
                class="mt-0.5 size-3.5 shrink-0"
              />
              {{ conditionText(question.depends_on) }}
            </p>
            <p
              v-if="question.allows_decline"
              class="text-xs text-neutral-500 dark:text-neutral-400"
            >
              {{ t('tests.questions.declinable') }}
            </p>
            <p
              v-if="!question.active"
              class="text-xs text-neutral-500 dark:text-neutral-400"
            >
              {{ t('tests.questions.actions.inactiveHelp') }}
            </p>
          </div>

          <div
            v-if="editable"
            class="flex w-full flex-wrap justify-end gap-1 sm:w-auto"
          >
            <UButton
              data-test="move-up"
              size="sm"
              color="neutral"
              variant="ghost"
              icon="i-lucide-arrow-up"
              :disabled="index === 0"
              :aria-label="t('tests.questions.actions.moveUp', { code: question.code })"
              @click="emit('move', index, index - 1)"
            />
            <UButton
              data-test="move-down"
              size="sm"
              color="neutral"
              variant="ghost"
              icon="i-lucide-arrow-down"
              :disabled="index === sorted.length - 1"
              :aria-label="t('tests.questions.actions.moveDown', { code: question.code })"
              @click="emit('move', index, index + 1)"
            />
            <UButton
              data-test="toggle-question"
              size="sm"
              color="neutral"
              variant="ghost"
              :icon="question.active ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              :aria-label="t(question.active ? 'tests.questions.actions.deactivate' : 'tests.questions.actions.activate', { code: question.code })"
              @click="emit('toggle', question)"
            />
            <UButton
              data-test="duplicate-question"
              size="sm"
              color="neutral"
              variant="ghost"
              icon="i-lucide-copy"
              :aria-label="t('tests.questions.actions.duplicate', { code: question.code })"
              @click="emit('duplicate', question)"
            />
            <UButton
              data-test="edit-question"
              size="sm"
              color="neutral"
              variant="ghost"
              icon="i-lucide-pencil"
              :aria-label="t('tests.questions.actions.edit', { code: question.code })"
              @click="emit('edit', question)"
            />
          </div>
        </div>
      </li>
    </ol>
  </div>
</template>
