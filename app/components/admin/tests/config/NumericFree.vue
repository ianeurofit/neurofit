<script setup lang="ts">
import type { LocalizedText } from '#shared/types/assessment'

// HU005 CA-07: a free number with an optional unit and optional limits and step.
const config = defineModel<Record<string, unknown>>('config', { required: true })

const { t } = useI18n()

/** Empty inputs are left out of the configuration: no limit. */
function setNumber(field: string, value: string | number) {
  const { [field]: _removed, ...rest } = config.value
  config.value = value === '' || value === null ? rest : { ...rest, [field]: Number(value) }
}

const unit = computed(() => (config.value.unit ?? null) as LocalizedText | null)

function setUnit(locale: 'es' | 'en', value: string) {
  const next = { ...(unit.value ?? { es: '' }), [locale]: value }
  const { unit: _removed, ...rest } = config.value
  config.value = !next.es.trim() && !next.en?.trim() ? rest : { ...rest, unit: next }
}
</script>

<template>
  <div
    data-test="config-numeric_free"
    class="space-y-4"
  >
    <div class="grid gap-4 sm:grid-cols-2">
      <UFormField
        v-for="locale in (['es', 'en'] as const)"
        :key="locale"
        :label="t(`tests.questions.config.unit${locale === 'es' ? 'Es' : 'En'}`)"
        :hint="t('tests.questions.form.optional')"
      >
        <UInput
          :model-value="unit?.[locale] ?? ''"
          :name="`config.unit.${locale}`"
          class="w-full"
          @update:model-value="setUnit(locale, String($event))"
        />
      </UFormField>
    </div>
    <div class="grid grid-cols-1 gap-4 min-[400px]:grid-cols-3">
      <UFormField
        v-for="field in (['min', 'max', 'step'] as const)"
        :key="field"
        :name="`config.${field}`"
        :label="t(`tests.questions.config.${field}`)"
        :hint="t('tests.questions.form.optional')"
      >
        <UInput
          :model-value="(config[field] as number | undefined) ?? ''"
          :name="`config.${field}`"
          type="number"
          step="any"
          class="w-full"
          @update:model-value="setNumber(field, $event)"
        />
      </UFormField>
    </div>
    <p class="text-sm text-neutral-600 dark:text-neutral-300">
      {{ t('tests.questions.config.limitsHelp') }}
    </p>
  </div>
</template>
