<script setup lang="ts">
import type { QuestionOption } from '#shared/types/assessment'

// HU031 / HU005: options of a choice question. A scale copies its options and scores; a
// multiple-choice question can also mark options as exclusive.

const props = withDefaults(defineProps<{ multiple?: boolean }>(), { multiple: false })

const options = defineModel<QuestionOption[]>('options', { required: true })
/** `config.exclusiveValues` of a multiple-choice question. */
const exclusive = defineModel<string[]>('exclusive', { default: () => [] })

const { t } = useI18n()
const toast = useToast()

const { scaleOptions, pending, hasError, refresh, apply } = useScales()

const selectedScale = ref(NO_SCALE)

const errorsByField = computed(() => {
  // "Fewer than two" only matters once the user starts adding options.
  const errors = options.value.length ? validateOptions(options.value) : []
  return Object.fromEntries(errors.map(error => [error.field, t(`errors.question.${error.code}`, { min: MIN_CHOICE_OPTIONS })]))
})

function optionError(index: number) {
  const fields = ['value', 'label', 'score'].map(field => errorsByField.value[`options.${index}.${field}`])
  return fields.find(Boolean)
}

function applyScaleCode(code: string) {
  selectedScale.value = code
  if (code === NO_SCALE) return

  options.value = apply(code)
  const name = scaleOptions.value.find(option => option.value === code)?.label ?? code
  toast.add({ title: t('scales.applied', { name }), color: 'success', icon: 'i-lucide-copy-check' })
}

function updateOption(index: number, patch: Partial<QuestionOption> & { labelEs?: string, labelEn?: string }) {
  options.value = options.value.map((option, position) => {
    if (position !== index) return option
    const { labelEs, labelEn, ...rest } = patch
    return {
      ...option,
      ...rest,
      label: { ...option.label, ...(labelEs !== undefined ? { es: labelEs } : {}), ...(labelEn !== undefined ? { en: labelEn } : {}) },
    }
  })
}

function parseScore(value: string | number) {
  if (value === '' || value === null) return null
  const number = Number(value)
  return Number.isFinite(number) ? number : Number.NaN
}

function addOption() {
  const taken = new Set(options.value.map(option => option.value))
  let next = options.value.length + 1
  while (taken.has(`option_${next}`)) next++

  options.value = [...options.value, { value: `option_${next}`, label: { es: '' }, score: null, isExclusive: false }]
}

function removeOption(index: number) {
  const removed = options.value[index]?.value
  options.value = options.value.filter((_, position) => position !== index)
  if (removed && exclusive.value.includes(removed)) exclusive.value = exclusive.value.filter(value => value !== removed)
}

function setExclusive(value: string, checked: boolean) {
  const others = exclusive.value.filter(item => item !== value)
  exclusive.value = checked ? [...others, value] : others
}

defineExpose({ applyScaleCode })
</script>

<template>
  <div class="space-y-5">
    <div
      v-if="pending"
      data-test="scales-loading"
      role="status"
      :aria-label="t('scales.loading')"
    >
      <USkeleton class="h-16 w-full rounded-xl" />
    </div>

    <UAlert
      v-else-if="hasError"
      role="alert"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      :title="t('scales.error')"
      :actions="[{ label: t('scales.retry'), color: 'error', variant: 'outline', onClick: () => refresh() }]"
    />

    <UFormField
      v-else
      :label="t('scales.label')"
      :help="t('scales.help')"
    >
      <USelect
        data-test="scale-select"
        :model-value="selectedScale"
        :items="scaleOptions"
        class="w-full sm:w-80"
        @update:model-value="applyScaleCode(String($event))"
      />
    </UFormField>

    <fieldset class="space-y-3">
      <legend class="text-sm font-semibold">
        {{ t('scales.options.title') }}
      </legend>

      <p
        v-if="!options.length"
        data-test="options-empty"
        class="rounded-xl border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-500 dark:border-white/15 dark:text-neutral-400"
      >
        {{ t('scales.options.empty') }}
      </p>

      <ol
        v-else
        class="space-y-3"
      >
        <li
          v-for="(option, index) in options"
          :key="index"
          data-test="option"
          class="rounded-xl border border-neutral-200 p-3 dark:border-white/10"
          :aria-label="t('scales.options.option', { index: index + 1 })"
        >
          <div class="grid gap-3 sm:grid-cols-[1fr_1fr_6rem_auto] sm:items-end">
            <UFormField :label="t('scales.options.labelEs')">
              <UInput
                :model-value="option.label.es"
                :name="`options.${index}.label.es`"
                class="w-full"
                @update:model-value="updateOption(index, { labelEs: String($event) })"
              />
            </UFormField>
            <UFormField :label="t('scales.options.labelEn')">
              <UInput
                :model-value="option.label.en ?? ''"
                :name="`options.${index}.label.en`"
                class="w-full"
                @update:model-value="updateOption(index, { labelEn: String($event) })"
              />
            </UFormField>
            <UFormField :label="t('scales.options.score')">
              <UInput
                :model-value="option.score ?? ''"
                :name="`options.${index}.score`"
                type="number"
                step="any"
                class="w-full"
                @update:model-value="updateOption(index, { score: parseScore($event) })"
              />
            </UFormField>
            <UButton
              data-test="remove-option"
              color="error"
              variant="ghost"
              icon="i-lucide-trash-2"
              class="justify-self-end"
              :aria-label="t('scales.options.remove', { index: index + 1 })"
              @click="removeOption(index)"
            />
          </div>
          <div class="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p class="font-mono text-xs break-all text-neutral-500 dark:text-neutral-400">
              {{ t('scales.options.value') }}: {{ option.value }}
            </p>
            <UCheckbox
              v-if="props.multiple"
              data-test="exclusive"
              :model-value="exclusive.includes(option.value)"
              :label="t('tests.questions.config.exclusive')"
              :description="t('tests.questions.config.exclusiveHelp')"
              @update:model-value="setExclusive(option.value, $event === true)"
            />
          </div>
          <p
            v-if="optionError(index)"
            data-test="option-error"
            class="mt-1 text-sm text-error"
          >
            {{ optionError(index) }}
          </p>
        </li>
      </ol>

      <p
        v-if="errorsByField.options"
        data-test="option-error"
        class="text-sm text-error"
      >
        {{ errorsByField.options }}
      </p>

      <UButton
        data-test="add-option"
        color="neutral"
        variant="outline"
        size="sm"
        icon="i-lucide-plus"
        :label="t('scales.options.add')"
        @click="addOption"
      />
    </fieldset>
  </div>
</template>
