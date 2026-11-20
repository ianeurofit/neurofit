<script setup lang="ts">
import type { LocalizedText } from '#shared/types/assessment'

// HU005 CA-04: a true/false answer is stored as a boolean; only its visible labels change.
const config = defineModel<Record<string, unknown>>('config', { required: true })

const { t } = useI18n()

const labels = computed(() => (config.value.labels ?? {}) as { true?: LocalizedText, false?: LocalizedText })

function setLabel(key: 'true' | 'false', locale: 'es' | 'en', value: string) {
  const current = labels.value[key] ?? { es: '' }
  config.value = { ...config.value, labels: { ...labels.value, [key]: { ...current, [locale]: value } } }
}

const PRESETS = {
  yesNo: { true: { es: 'Sí', en: 'Yes' }, false: { es: 'No', en: 'No' } },
  trueFalse: { true: { es: 'Verdadero', en: 'True' }, false: { es: 'Falso', en: 'False' } },
}

function applyPreset(name: keyof typeof PRESETS) {
  config.value = { ...config.value, labels: structuredClone(PRESETS[name]) }
}
</script>

<template>
  <div
    data-test="config-true_false"
    class="space-y-4"
  >
    <div class="flex flex-wrap items-center gap-2">
      <span class="text-sm text-neutral-600 dark:text-neutral-300">{{ t('tests.questions.config.presets') }}</span>
      <UButton
        size="xs"
        color="neutral"
        variant="outline"
        :label="t('tests.questions.config.presetYesNo')"
        @click="applyPreset('yesNo')"
      />
      <UButton
        size="xs"
        color="neutral"
        variant="outline"
        :label="t('tests.questions.config.presetTrueFalse')"
        @click="applyPreset('trueFalse')"
      />
    </div>
    <div class="grid gap-4 sm:grid-cols-2">
      <UFormField
        v-for="field in (['true', 'false'] as const).flatMap(key => (['es', 'en'] as const).map(locale => ({ key, locale })))"
        :key="`${field.key}.${field.locale}`"
        :label="t(`tests.questions.config.${field.key}${field.locale === 'es' ? 'Es' : 'En'}`)"
        :required="field.locale === 'es'"
      >
        <UInput
          :model-value="labels[field.key]?.[field.locale] ?? ''"
          :name="`config.labels.${field.key}.${field.locale}`"
          class="w-full"
          @update:model-value="setLabel(field.key, field.locale, String($event))"
        />
      </UFormField>
    </div>
    <UFormField name="config.labels" />
  </div>
</template>
