<script setup lang="ts">
import type { LocalizedText } from '#shared/types/assessment'

// HU005 CA-05: min < max (1 and 10 by default), with optional labels at both ends.
const config = defineModel<Record<string, unknown>>('config', { required: true })

const { t } = useI18n()

function toNumber(value: string | number) {
  return value === '' ? null : Number(value)
}

function set(field: string, value: unknown) {
  config.value = { ...config.value, [field]: value }
}

function label(field: 'minLabel' | 'maxLabel') {
  return (config.value[field] ?? null) as LocalizedText | null
}

function setLabel(field: 'minLabel' | 'maxLabel', locale: 'es' | 'en', value: string) {
  const next = { ...(label(field) ?? { es: '' }), [locale]: value }
  const empty = !next.es.trim() && !next.en?.trim()
  const { [field]: _removed, ...rest } = config.value
  config.value = empty ? rest : { ...rest, [field]: next }
}
</script>

<template>
  <div
    data-test="config-numeric_scale"
    class="space-y-4"
  >
    <div class="grid grid-cols-2 gap-4">
      <UFormField
        v-for="field in (['min', 'max'] as const)"
        :key="field"
        :name="`config.${field}`"
        :label="t(`tests.questions.config.${field}`)"
        required
      >
        <UInput
          :model-value="(config[field] as number | null) ?? ''"
          :name="`config.${field}`"
          type="number"
          step="1"
          class="w-full"
          @update:model-value="set(field, toNumber($event))"
        />
      </UFormField>
    </div>
    <div class="grid gap-4 sm:grid-cols-2">
      <template
        v-for="field in (['minLabel', 'maxLabel'] as const)"
        :key="field"
      >
        <UFormField
          v-for="locale in (['es', 'en'] as const)"
          :key="`${field}.${locale}`"
          :label="t(`tests.questions.config.${field}${locale === 'es' ? 'Es' : 'En'}`)"
          :hint="t('tests.questions.form.optional')"
        >
          <UInput
            :model-value="label(field)?.[locale] ?? ''"
            :name="`config.${field}.${locale}`"
            class="w-full"
            @update:model-value="setLabel(field, locale, String($event))"
          />
        </UFormField>
      </template>
    </div>
  </div>
</template>
