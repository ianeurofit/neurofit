<script setup lang="ts" generic="S extends Record<string, any>">
import type { FormError } from '@nuxt/ui'

const props = withDefaults(defineProps<{
  state: S
  required?: string[]
  loading?: boolean
  submitLabel?: string
  /** Extra checks of the screen, already translated. They run after the required ones. */
  validate?: (state: Partial<S>) => FormError[]
}>(), { required: () => [], loading: false, submitLabel: undefined, validate: undefined })

const emit = defineEmits<{ submit: [state: S] }>()

const { t } = useI18n()

const form = useTemplateRef<{ setErrors: (errors: FormError[]) => void }>('form')

function runValidation(values: Partial<S>): FormError[] {
  const required = validateRequired(values, props.required).map(error => ({
    name: error.name,
    message: t(`management.form.errors.${error.code}`),
  }))
  const missing = new Set(required.map(error => error.name))
  const extra = (props.validate?.(values) ?? []).filter(error => !missing.has(error.name ?? ''))

  return [...required, ...extra]
}

/** Shows errors that only the server knows about (e.g. a repeated code) next to their fields. */
function setErrors(errors: FormError[]) {
  form.value?.setErrors(errors)
}

defineExpose({ setErrors })
</script>

<template>
  <UForm
    ref="form"
    :state="state"
    :validate="runValidation"
    class="space-y-5"
    @submit="emit('submit', state)"
  >
    <slot :state="state" />

    <div class="flex flex-wrap items-center justify-end gap-3">
      <slot name="actions" />
      <UButton
        type="submit"
        :loading="loading"
        :disabled="loading"
        :label="submitLabel || t('management.form.save')"
      />
    </div>
  </UForm>
</template>
