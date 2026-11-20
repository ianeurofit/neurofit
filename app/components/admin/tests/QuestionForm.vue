<script setup lang="ts">
import type { FormError } from '@nuxt/ui'
import ChoiceOptions from './config/ChoiceOptions.vue'
import TrueFalseConfig from './config/TrueFalse.vue'
import NumericScaleConfig from './config/NumericScale.vue'
import AgreementConfig from './config/Agreement.vue'
import NumericFreeConfig from './config/NumericFree.vue'
import OpenTextConfig from './config/OpenText.vue'
import type { QuestionFormState } from '#shared/utils/questions'
import type { ConditionTarget } from '#shared/utils/conditions'
import type { ConditionOperator, QuestionType, SectionSummary } from '#shared/types/assessment'

// HU005: one question of a test. Code, prompt, type and "required" are mandatory; the rest is
// optional. Each type has its own configuration subform (config/*.vue).
// HU006: the question can be deactivated and shown only under a condition on another question.

const props = withDefaults(defineProps<{
  sections: SectionSummary[]
  /** The other questions of the test, which a condition may point to. */
  questions?: ConditionTarget[]
  loading?: boolean
  /** A general error of the server (e.g. `new_version_required`), already a code. */
  general?: string | null
}>(), { questions: () => [], loading: false, general: null })

const state = defineModel<QuestionFormState>('state', { required: true })

const emit = defineEmits<{ submit: [state: QuestionFormState], cancel: [] }>()

const { t, locale } = useI18n()

const form = useTemplateRef<{ setErrors: (errors: FormError[]) => void }>('form')

const CONFIG_FORMS = {
  true_false: TrueFalseConfig,
  numeric_scale: NumericScaleConfig,
  agreement: AgreementConfig,
  numeric_free: NumericFreeConfig,
  open_text: OpenTextConfig,
} as const

const isChoice = computed(() => CHOICE_TYPES.includes(state.value.type))
const configForm = computed(() => (isChoice.value ? null : CONFIG_FORMS[state.value.type as keyof typeof CONFIG_FORMS]))

const typeItems = computed(() => QUESTION_TYPES.map(type => ({ value: type, label: t(`tests.questions.types.${type}`) })))
const directionItems = computed(() => QUESTION_DIRECTIONS.map(direction => ({ value: direction, label: t(`tests.questions.directions.${direction}`) })))
const sectionItems = computed(() => props.sections.map(section => ({
  value: section.id,
  label: `${section.code} · ${localizedText(section.title, locale.value)}`,
})))

const exclusive = computed({
  get: () => (Array.isArray(state.value.config.exclusiveValues) ? state.value.config.exclusiveValues as string[] : []),
  set: (values: string[]) => {
    state.value.config = { ...state.value.config, exclusiveValues: values }
  },
})

function changeType(type: QuestionType) {
  changeQuestionType(state.value, type)
}

function message(field: string, code: string) {
  return t(questionErrorKey(field, code), questionErrorParams(code))
}

/** CA-08 (HU005), CA-05/CA-06 (HU006): every error of the question and its condition, next to its field. */
function validate(values: Partial<QuestionFormState>): FormError[] {
  const body = formToQuestionBody({ ...state.value, ...values })
  return [
    ...validateQuestionInput(body).errors.filter(error => !error.field.startsWith('options.')),
    ...conditionErrors(body.code, body.dependsOn ?? null, props.questions),
  ].map(error => ({ name: questionErrorToFormField(error.field), message: message(error.field, error.code) }))
}

/** Shows errors that only the server knows about (e.g. a repeated code) next to their fields. */
function setErrors(errors: Array<{ field: string, code: string }>) {
  form.value?.setErrors(errors.map(error => ({ name: questionErrorToFormField(error.field), message: message(error.field, error.code) })))
}

// --- Condition (HU006) ---------------------------------------------------------------------

const conditionTarget = computed(() => props.questions.find(question => question.code === state.value.dependsOn?.questionCode) ?? null)
/** Questions that can be the source of a condition (free text cannot). */
const conditionSources = computed(() => props.questions.filter(question => OPERATORS_BY_TYPE[question.type].length))
const conditionQuestionItems = computed(() => conditionSources.value.map(question => ({ value: question.code, label: question.code })))
const conditionOpItems = computed(() => (conditionTarget.value ? OPERATORS_BY_TYPE[conditionTarget.value.type] : [])
  .map(op => ({ value: op, label: t(`tests.questions.condition.ops.${op}`) })))

/** The answers a question can have, as select items (empty for free numbers). */
function valueItems(target: ConditionTarget | null): Array<{ value: string | number, label: string }> {
  if (!target) return []
  switch (target.type) {
    case 'single_choice':
    case 'multiple_choice':
      return target.options.map(option => ({ value: option.value, label: localizedText(option.label, locale.value) || option.value }))
    case 'true_false':
      return [{ value: 'true', label: t('tests.questions.condition.yes') }, { value: 'false', label: t('tests.questions.condition.no') }]
    case 'agreement':
      return [1, 2, 3, 4, 5].map(value => ({ value, label: String(value) }))
    case 'numeric_scale': {
      const min = Number(target.config.min ?? 1)
      const max = Number(target.config.max ?? 10)
      return Array.from({ length: Math.max(0, Math.min(max - min + 1, 100)) }, (_, index) => ({ value: min + index, label: String(min + index) }))
    }
    default:
      return []
  }
}

const conditionValueItems = computed(() => valueItems(conditionTarget.value))

function defaultConditionValue(target: ConditionTarget, op: ConditionOperator): unknown {
  const first = target.type === 'true_false'
    ? true
    : target.type === 'numeric_free' ? Number(target.config.min ?? 0) : valueItems(target)[0]?.value ?? null
  return op === 'in' ? [first] : first
}

const conditionEnabled = computed({
  get: () => state.value.dependsOn !== null,
  set: (enabled: boolean) => {
    if (!enabled) state.value.dependsOn = null
    else if (conditionSources.value[0]) setConditionQuestion(conditionSources.value[0].code)
  },
})

function setConditionQuestion(code: string) {
  const target = props.questions.find(question => question.code === code)
  if (!target) return
  const op = OPERATORS_BY_TYPE[target.type][0]!
  state.value.dependsOn = { questionCode: code, op, value: defaultConditionValue(target, op) }
}

function setConditionOp(op: ConditionOperator) {
  const condition = state.value.dependsOn
  if (!condition || !conditionTarget.value) return
  state.value.dependsOn = { ...condition, op, value: defaultConditionValue(conditionTarget.value, op) }
}

/** Select values are strings for booleans; the condition stores real booleans and numbers. */
const conditionValue = computed({
  get: () => {
    const value = state.value.dependsOn?.value
    return typeof value === 'boolean' ? String(value) : value as string | number | Array<string | number> | null
  },
  set: (value: unknown) => {
    if (!state.value.dependsOn) return
    const type = conditionTarget.value?.type
    const parse = (item: unknown) => (type === 'true_false' ? item === 'true' : type === 'numeric_free' ? (item === '' ? null : Number(item)) : item)
    state.value.dependsOn = { ...state.value.dependsOn, value: Array.isArray(value) ? value.map(parse) : parse(value) }
  },
})

defineExpose({ setErrors, changeType, setConditionQuestion })
</script>

<template>
  <div class="space-y-5">
    <p
      v-if="!sections.length"
      data-test="no-sections"
      class="rounded-xl border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-500 dark:border-white/15 dark:text-neutral-400"
    >
      {{ t('tests.questions.noSections') }}
    </p>

    <template v-else>
      <UAlert
        v-if="general"
        role="alert"
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        :title="t(`errors.question.${general}`)"
      />

      <DashboardManagementForm
        ref="form"
        :state="state"
        :required="['code', 'promptEs']"
        :validate="validate"
        :loading="loading"
        :submit-label="t('tests.questions.form.save')"
        @submit="emit('submit', state)"
      >
        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField
            name="sectionId"
            :label="t('tests.questions.form.section')"
            required
          >
            <USelect
              v-model="state.sectionId"
              data-test="section-select"
              :items="sectionItems"
              class="w-full"
            />
          </UFormField>
          <UFormField
            name="code"
            :label="t('tests.questions.form.code')"
            :help="t('tests.questions.form.codeHelp')"
            required
          >
            <UInput
              v-model="state.code"
              name="code"
              autocomplete="off"
              class="w-full font-mono uppercase"
            />
          </UFormField>
        </div>

        <UFormField
          name="promptEs"
          :label="t('tests.questions.form.promptEs')"
          required
        >
          <UTextarea
            v-model="state.promptEs"
            name="promptEs"
            :rows="2"
            autoresize
            class="w-full"
          />
        </UFormField>
        <UFormField
          name="promptEn"
          :label="t('tests.questions.form.promptEn')"
          :hint="t('tests.questions.form.optional')"
        >
          <UTextarea
            v-model="state.promptEn"
            name="promptEn"
            :rows="2"
            autoresize
            class="w-full"
          />
        </UFormField>

        <div class="grid gap-4 sm:grid-cols-2 sm:items-start">
          <UFormField
            name="type"
            :label="t('tests.questions.form.type')"
            :help="t('tests.questions.form.typeHelp')"
            required
          >
            <USelect
              data-test="type-select"
              :model-value="state.type"
              :items="typeItems"
              class="w-full"
              @update:model-value="changeType($event as QuestionType)"
            />
          </UFormField>
          <div class="space-y-3 sm:pt-6">
            <USwitch
              v-model="state.required"
              data-test="required"
              :label="t('tests.questions.form.required')"
              :description="t('tests.questions.form.requiredHelp')"
            />
            <USwitch
              v-model="state.allowsDecline"
              data-test="allows-decline"
              :label="t('tests.questions.form.allowsDecline')"
            />
            <USwitch
              v-model="state.active"
              data-test="active"
              :label="t('tests.questions.form.active')"
              :description="t('tests.questions.form.activeHelp')"
            />
          </div>
        </div>

        <fieldset class="space-y-4 rounded-2xl border border-neutral-200 p-4 dark:border-white/10">
          <legend class="px-1 text-sm font-semibold">
            {{ t('tests.questions.config.title') }} · {{ t(`tests.questions.types.${state.type}`) }}
          </legend>
          <div
            v-if="isChoice"
            data-test="config-choice"
          >
            <ChoiceOptions
              v-model:options="state.options"
              v-model:exclusive="exclusive"
              :multiple="state.type === 'multiple_choice'"
            />
            <UFormField
              name="config.exclusiveValues"
              class="mt-2"
            />
          </div>
          <component
            :is="configForm"
            v-else-if="configForm"
            v-model:config="state.config"
          />
        </fieldset>

        <fieldset
          data-test="condition-editor"
          class="space-y-4 rounded-2xl border border-neutral-200 p-4 dark:border-white/10"
        >
          <legend class="px-1 text-sm font-semibold">
            {{ t('tests.questions.condition.title') }}
          </legend>
          <p class="text-sm text-neutral-600 dark:text-neutral-300">
            {{ t('tests.questions.condition.help') }}
          </p>

          <p
            v-if="!conditionSources.length"
            data-test="condition-empty"
            class="rounded-xl border border-dashed border-neutral-300 px-4 py-4 text-center text-sm text-neutral-500 dark:border-white/15 dark:text-neutral-400"
          >
            {{ t('tests.questions.condition.empty') }}
          </p>

          <template v-else>
            <UCheckbox
              v-model="conditionEnabled"
              data-test="condition-toggle"
              :label="t('tests.questions.condition.enable')"
            />

            <div
              v-if="state.dependsOn"
              class="grid gap-4 sm:grid-cols-3"
            >
              <UFormField
                name="dependsOn.questionCode"
                :label="t('tests.questions.condition.question')"
              >
                <USelect
                  data-test="condition-question"
                  :model-value="state.dependsOn.questionCode"
                  :items="conditionQuestionItems"
                  class="w-full font-mono"
                  @update:model-value="setConditionQuestion(String($event))"
                />
                <template #error="{ error }">
                  <span data-test="condition-error">{{ error }}</span>
                </template>
              </UFormField>
              <UFormField
                name="dependsOn.op"
                :label="t('tests.questions.condition.op')"
              >
                <USelect
                  data-test="condition-op"
                  :model-value="state.dependsOn.op"
                  :items="conditionOpItems"
                  class="w-full"
                  @update:model-value="setConditionOp($event as ConditionOperator)"
                />
                <template #error="{ error }">
                  <span data-test="condition-error">{{ error }}</span>
                </template>
              </UFormField>
              <UFormField
                name="dependsOn.value"
                :label="state.dependsOn.op === 'in' ? t('tests.questions.condition.values') : t('tests.questions.condition.value')"
              >
                <UInput
                  v-if="conditionTarget?.type === 'numeric_free'"
                  v-model="conditionValue as string | number"
                  data-test="condition-value"
                  name="dependsOn.value"
                  type="number"
                  step="any"
                  class="w-full"
                />
                <USelect
                  v-else
                  v-model="conditionValue as never"
                  data-test="condition-value"
                  :items="conditionValueItems"
                  :multiple="state.dependsOn.op === 'in'"
                  class="w-full"
                />
                <template #error="{ error }">
                  <span data-test="condition-error">{{ error }}</span>
                </template>
              </UFormField>
            </div>
          </template>
        </fieldset>

        <details class="group rounded-2xl border border-neutral-200 p-4 dark:border-white/10">
          <summary class="cursor-pointer rounded text-sm font-semibold focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">
            {{ t('tests.questions.form.advanced') }}
          </summary>
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <UFormField
              name="variable"
              :label="t('tests.questions.form.variable')"
              :help="t('tests.questions.form.variableHelp')"
            >
              <UInput
                v-model="state.variable"
                name="variable"
                autocomplete="off"
                class="w-full font-mono"
              />
            </UFormField>
            <UFormField
              name="direction"
              :label="t('tests.questions.form.direction')"
            >
              <USelect
                v-model="state.direction"
                :items="directionItems"
                class="w-full"
              />
            </UFormField>
            <UFormField
              name="weight"
              :label="t('tests.questions.form.weight')"
              :help="t('tests.questions.form.weightHelp')"
            >
              <UInput
                v-model="state.weight"
                name="weight"
                type="number"
                min="0"
                step="any"
                class="w-full"
              />
            </UFormField>
            <UFormField
              name="source"
              :label="t('tests.questions.form.source')"
              :help="t('tests.questions.form.sourceHelp')"
            >
              <UInput
                v-model="state.source"
                name="source"
                class="w-full"
              />
            </UFormField>
            <UFormField
              name="hintEs"
              :label="t('tests.questions.form.hintEs')"
              :help="t('tests.questions.form.hintHelp')"
            >
              <UTextarea
                v-model="state.hintEs"
                name="hintEs"
                :rows="2"
                autoresize
                class="w-full"
              />
            </UFormField>
            <UFormField
              name="hintEn"
              :label="t('tests.questions.form.hintEn')"
            >
              <UTextarea
                v-model="state.hintEn"
                name="hintEn"
                :rows="2"
                autoresize
                class="w-full"
              />
            </UFormField>
          </div>
        </details>

        <template #actions>
          <UButton
            color="neutral"
            variant="ghost"
            :label="t('tests.questions.form.cancel')"
            @click="emit('cancel')"
          />
        </template>
      </DashboardManagementForm>
    </template>
  </div>
</template>
