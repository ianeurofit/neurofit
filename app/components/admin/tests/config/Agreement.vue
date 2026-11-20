<script setup lang="ts">
import type { LocalizedText } from '#shared/types/assessment'

// HU005 CA-06: a fixed 5-point scale whose labels can be edited.
const config = defineModel<Record<string, unknown>>('config', { required: true })

const { t } = useI18n()

const labels = computed(() => (Array.isArray(config.value.labels) ? config.value.labels : []) as LocalizedText[])

function setLabel(index: number, locale: 'es' | 'en', value: string) {
  const next = labels.value.map((label, position) => (position === index ? { ...label, [locale]: value } : label))
  config.value = { ...config.value, labels: next }
}
</script>

<template>
  <div
    data-test="config-agreement"
    class="space-y-3"
  >
    <p class="text-sm text-neutral-600 dark:text-neutral-300">
      {{ t('tests.questions.config.agreementHelp') }}
    </p>
    <ol class="space-y-3">
      <li
        v-for="(label, index) in labels"
        :key="index"
        data-test="agreement-label"
        class="rounded-xl border border-neutral-200 p-3 dark:border-white/10"
      >
        <p class="mb-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
          {{ t('tests.questions.config.point', { index: index + 1 }) }}
        </p>
        <div class="grid gap-3 sm:grid-cols-2">
          <UFormField
            :name="`config.labels.${index}`"
            :label="t('tests.questions.config.labelEs')"
            required
          >
            <UInput
              :model-value="label.es"
              :name="`config.labels.${index}.es`"
              class="w-full"
              @update:model-value="setLabel(index, 'es', String($event))"
            />
          </UFormField>
          <UFormField :label="t('tests.questions.config.labelEn')">
            <UInput
              :model-value="label.en ?? ''"
              :name="`config.labels.${index}.en`"
              class="w-full"
              @update:model-value="setLabel(index, 'en', String($event))"
            />
          </UFormField>
        </div>
      </li>
    </ol>
    <UFormField name="config.labels" />
  </div>
</template>
