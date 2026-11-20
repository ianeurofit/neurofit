<script setup lang="ts">
import type { QuestionDetail, SectionSummary } from '#shared/types/assessment'

definePageMeta({ layout: 'dashboard', titleKey: 'dashboard.titles.testQuestions' })

const { t, locale } = useI18n()
const localePath = useLocalePath()
const toast = useToast()
const route = useRoute()

useSeoMeta({ title: () => t('seo.testQuestions.title'), robots: 'noindex' })

const testId = String(route.params.id)
const { test, sections, pending: testPending, hasError: testError, editable, refresh: refreshTest } = useTestSections(testId)
const {
  preview, pending: questionsPending, hasError: questionsError, refresh: refreshQuestions,
  draft, editing, general, saving, startNew, startEdit, save, conditionTargets, duplicate, toggleActive, move,
} = useQuestionEditor(testId)

const pending = computed(() => testPending.value || questionsPending.value)
const hasError = computed(() => testError.value || questionsError.value)

function retry() {
  refreshTest()
  refreshQuestions()
}

/** CA-09: the preview, grouped under each section in order. */
const groups = computed(() => sections.value.map((section: SectionSummary) => ({
  section,
  questions: preview.value.filter(question => question.section_id === section.id),
})))

function notifyFailure(general: string) {
  toast.add({ title: t(`errors.question.${general}`), color: 'error', icon: 'i-lucide-circle-alert' })
}

async function onDuplicate(question: QuestionDetail) {
  const result = await duplicate(question)
  if (!result.ok) return notifyFailure(result.general)
  toast.add({ title: t('tests.questions.actions.duplicated', { code: result.copy?.code ?? '' }), color: 'success', icon: 'i-lucide-copy-check' })
}

async function onToggle(question: QuestionDetail) {
  const result = await toggleActive(question)
  if (!result.ok) return notifyFailure(result.general)
  toast.add({
    title: t(question.active ? 'tests.questions.actions.deactivated' : 'tests.questions.actions.activated'),
    color: 'success',
    icon: 'i-lucide-check',
  })
}

async function onMove(sectionId: string, from: number, to: number) {
  const result = await move(sectionId, from, to)
  if (!result.ok) notifyFailure(result.general === 'unknown' ? 'invalid_order' : result.general)
}

// Form slideover
const formOpen = ref(false)
const form = useTemplateRef<{ setErrors: (errors: Array<{ field: string, code: string }>) => void }>('form')

function openNew(sectionId: string) {
  startNew(sectionId)
  formOpen.value = true
}

function openEdit(question: QuestionDetail) {
  startEdit(question)
  formOpen.value = true
}

function closeForm() {
  formOpen.value = false
}

async function onSubmit() {
  const result = await save()

  if (result.ok) {
    formOpen.value = false
    toast.add({ title: t('tests.questions.saved'), color: 'success', icon: 'i-lucide-check' })
    return
  }
  form.value?.setErrors(result.errors)
}
</script>

<template>
  <div class="space-y-8">
    <section class="rounded-2xl bg-ink-950 p-6 text-white ring-1 ring-white/10 sm:p-8">
      <UButton
        :to="localePath(`/dashboard/tests/${testId}`)"
        color="neutral"
        variant="link"
        icon="i-lucide-arrow-left"
        class="-ms-2.5 text-neutral-300"
        :label="t('tests.questions.back')"
      />
      <p class="section-eyebrow mt-3 text-brand-400">
        {{ t('tests.questions.eyebrow') }}
      </p>
      <template v-if="test">
        <h2 class="mt-3 text-2xl font-extrabold break-words sm:text-3xl">
          {{ localizedText(test.title, locale) }}
        </h2>
        <p class="mt-2 font-mono text-xs break-all text-neutral-300">
          {{ test.code }} · {{ t('tests.admin.version', { version: test.version }) }}
        </p>
      </template>
      <p class="mt-2 max-w-2xl text-sm text-neutral-300">
        {{ t('tests.questions.intro') }}
      </p>
    </section>

    <UAlert
      v-if="test && !editable"
      data-test="locked"
      color="warning"
      variant="soft"
      icon="i-lucide-lock"
      :title="t('tests.sections.locked')"
    />

    <div
      v-if="pending"
      data-test="questions-loading"
      role="status"
      :aria-label="t('tests.questions.loading')"
      class="space-y-3"
    >
      <USkeleton class="h-24 w-full rounded-2xl" />
      <USkeleton class="h-24 w-full rounded-2xl" />
    </div>

    <UAlert
      v-else-if="hasError"
      data-test="questions-error"
      role="alert"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      :title="t('tests.questions.error')"
      :actions="[{ label: t('tests.questions.retry'), color: 'error', variant: 'outline', onClick: retry }]"
    />

    <div
      v-else-if="!sections.length"
      data-test="no-sections"
      class="rounded-2xl border border-dashed border-neutral-300 px-4 py-10 text-center dark:border-white/15"
    >
      <p class="text-sm text-neutral-600 dark:text-neutral-300">
        {{ t('tests.questions.noSections') }}
      </p>
      <UButton
        class="mt-4"
        color="neutral"
        variant="outline"
        icon="i-lucide-layers"
        :to="localePath(`/dashboard/tests/${testId}`)"
        :label="t('tests.questions.back')"
      />
    </div>

    <div
      v-else
      class="space-y-6"
    >
      <div>
        <h3 class="text-lg font-bold">
          {{ t('tests.questions.preview') }}
        </h3>
        <p class="text-sm text-neutral-600 dark:text-neutral-300">
          {{ t('tests.questions.previewHelp') }}
        </p>
      </div>

      <section
        v-for="group in groups"
        :key="group.section.id"
        data-test="question-section"
        class="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 dark:border-white/10 dark:bg-white/5"
        :aria-labelledby="`section-${group.section.id}`"
      >
        <header class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="font-mono text-xs break-all text-neutral-500 dark:text-neutral-400">
              {{ group.section.position }} · {{ group.section.code }}
            </p>
            <h4
              :id="`section-${group.section.id}`"
              class="font-semibold break-words"
            >
              {{ localizedText(group.section.title, locale) }}
            </h4>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              {{ t('tests.questions.count', { count: group.questions.length }, group.questions.length) }}
            </p>
          </div>
          <UButton
            v-if="editable"
            data-test="add-question"
            size="sm"
            icon="i-lucide-plus"
            :label="t('tests.questions.add')"
            @click="openNew(group.section.id)"
          />
        </header>

        <AdminTestsQuestionList
          class="mt-4"
          :questions="group.questions"
          :editable="editable"
          :pending="false"
          :error="false"
          @edit="openEdit"
          @duplicate="onDuplicate"
          @toggle="onToggle"
          @move="(from, to) => onMove(group.section.id, from, to)"
          @retry="retry"
        />
      </section>
    </div>

    <USlideover
      v-model:open="formOpen"
      :title="editing ? t('tests.questions.form.editTitle') : t('tests.questions.form.addTitle')"
      :ui="{ content: 'w-full sm:max-w-2xl' }"
    >
      <template #body>
        <AdminTestsQuestionForm
          ref="form"
          :state="draft"
          :sections="sections"
          :questions="conditionTargets"
          :loading="saving"
          :general="general"
          @submit="onSubmit"
          @cancel="closeForm"
        />
      </template>
    </USlideover>
  </div>
</template>
