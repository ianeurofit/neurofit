<script setup lang="ts">
// HU005 CA-07: free text with a maximum length (1000 by default, 1 to 5000).
const config = defineModel<Record<string, unknown>>('config', { required: true })

const { t } = useI18n()

function setMaxLength(value: string | number) {
  config.value = { ...config.value, maxLength: value === '' ? null : Number(value) }
}
</script>

<template>
  <div data-test="config-open_text">
    <UFormField
      name="config.maxLength"
      :label="t('tests.questions.config.maxLength')"
      :help="t('tests.questions.config.maxLengthHelp')"
      required
    >
      <UInput
        :model-value="(config.maxLength as number | null) ?? ''"
        name="config.maxLength"
        type="number"
        :min="OPEN_TEXT_MAX_LENGTH.min"
        :max="OPEN_TEXT_MAX_LENGTH.max"
        step="1"
        class="w-full sm:w-48"
        @update:model-value="setMaxLength($event)"
      />
    </UFormField>
  </div>
</template>
