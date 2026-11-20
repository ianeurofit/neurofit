<script setup lang="ts">
import type { SectionSummary } from '#shared/types/assessment'
import type { SectionFormState } from '#shared/utils/tests'

definePageMeta({ layout: 'dashboard', titleKey: 'dashboard.titles.testDetail' })

const { t, locale } = useI18n()
const localePath = useLocalePath()
const toast = useToast()
const route = useRoute()

useSeoMeta({ title: () => t('seo.testDetail.title'), robots: 'noindex' })

const testId = String(route.params.id)
const {
  test, sections, pending, hasError, editable, refresh, save, move, deletePlan, remove, errorMessage, validateForm,
} = useTestSections(testId)

// HU007: publish, new version and archive.
const lifecycle = useTestLifecycle(testId)
const { groups: publishGroups, busy: lifecycleBusy, canPublish, canCreateVersion, canArchive } = lifecycle
const showPublishErrors = ref(false)
const publishOpen = ref(false)
const archiveOpen = ref(false)

function notifyLifecycle(general?: string) {
  toast.add({ title: t(`tests.publish.errors.${general ?? 'unknown'}`), color: 'error', icon: 'i-lucide-circle-alert' })
}

/** CA-01: the errors show first; with none, the user confirms (CA-02). */
async function onPublishClick() {
  await lifecycle.refresh()
  showPublishErrors.value = publishGroups.value.length > 0
  if (!showPublishErrors.value) publishOpen.value = true
}

async function onConfirmPublish() {
  const result = await lifecycle.publish()
  publishOpen.value = false

  if (result.ok) {
    showPublishErrors.value = false
    await refresh()
    toast.add({ title: t('tests.publish.published'), color: 'success', icon: 'i-lucide-check' })
  }
  else if (result.general) notifyLifecycle(result.general)
  else showPublishErrors.value = true
}

async function onNewVersion() {
  const result = await lifecycle.newVersion()
  if (!result.ok) return notifyLifecycle(result.general)

  toast.add({ title: t('tests.publish.versionCreated', { version: result.version }), color: 'success', icon: 'i-lucide-copy-plus' })
  await navigateTo(localePath(`/dashboard/tests/${result.id}`))
}

async function onConfirmArchive() {
  const result = await lifecycle.archive()
  archiveOpen.value = false

  if (!result.ok) return notifyLifecycle(result.general)
  await refresh()
  toast.add({ title: t('tests.publish.archived'), color: 'success', icon: 'i-lucide-archive' })
}

function closePublish() {
  publishOpen.value = false
}

function openArchive() {
  archiveOpen.value = true
}

function closeArchive() {
  archiveOpen.value = false
}

// HU008: import from a Markdown file (drafts only).
const importOpen = ref(false)

function openImport() {
  importOpen.value = true
}

async function onImported() {
  await Promise.all([refresh(), lifecycle.refresh()])
}

const EMPTY_FORM: SectionFormState = { code: '', titleEs: '', titleEn: '', domain: '' }

// Add / edit modal
const formOpen = ref(false)
const editing = ref<SectionSummary | null>(null)
const formState = reactive<SectionFormState>({ ...EMPTY_FORM })
const saving = ref(false)
const formGeneral = ref<string | null>(null)
const form = useTemplateRef<{ setErrors: (errors: { name: string, message: string }[]) => void }>('form')

function openForm(section: SectionSummary | null) {
  editing.value = section
  Object.assign(formState, section ? sectionToForm(section) : EMPTY_FORM)
  formGeneral.value = null
  formOpen.value = true
}

function closeForm() {
  formOpen.value = false
}

function cancelDelete() {
  toDelete.value = null
}

function notifyFailure(general?: string) {
  toast.add({ title: t(`tests.sections.errors.${general ?? 'unknown'}`), color: 'error', icon: 'i-lucide-circle-alert' })
}

async function onSave() {
  saving.value = true
  formGeneral.value = null
  const result = await save(editing.value, formState)
  saving.value = false

  if (result.ok) {
    formOpen.value = false
    toast.add({ title: t('tests.sections.saved'), color: 'success', icon: 'i-lucide-check' })
    return
  }

  if (result.general) formGeneral.value = result.general
  form.value?.setErrors(result.errors.map(error => ({
    name: sectionErrorToFormField(error.field),
    message: errorMessage(error),
  })))
}

async function onMove(from: number, to: number) {
  const result = await move(from, to)
  if (!result.ok) notifyFailure(result.general)
}

// Delete confirmation
const toDelete = ref<SectionSummary | null>(null)
const deleting = ref(false)
const confirmOpen = computed({
  get: () => toDelete.value !== null,
  set: (open) => {
    if (!open) toDelete.value = null
  },
})

const confirmBody = computed(() => {
  const section = toDelete.value
  if (!section) return ''
  const title = localizedText(section.title, locale.value)
  const plan = deletePlan(section)

  return plan.needsConfirm
    ? t('tests.sections.confirm.bodyQuestions', { title, count: plan.questionCount }, plan.questionCount)
    : t('tests.sections.confirm.body', { title })
})

async function onConfirmDelete() {
  if (!toDelete.value) return
  deleting.value = true
  const result = await remove(toDelete.value)
  deleting.value = false
  toDelete.value = null

  if (result.ok) toast.add({ title: t('tests.sections.deleted'), color: 'success', icon: 'i-lucide-check' })
  else notifyFailure(result.general)
}
</script>

<template>
  <div class="space-y-8">
    <section class="rounded-2xl bg-ink-950 p-6 text-white ring-1 ring-white/10 sm:p-8">
      <UButton
        :to="localePath('/dashboard/tests')"
        color="neutral"
        variant="link"
        icon="i-lucide-arrow-left"
        class="-ms-2.5 text-neutral-300"
        :label="t('tests.sections.back')"
      />
      <p class="section-eyebrow mt-3 text-brand-400">
        {{ t('tests.sections.eyebrow') }}
      </p>
      <template v-if="test">
        <div class="mt-3 flex flex-wrap items-center gap-3">
          <h2 class="text-2xl font-extrabold break-words sm:text-3xl">
            {{ localizedText(test.title, locale) }}
          </h2>
          <UBadge
            variant="soft"
            class="rounded-full"
            :color="test.status === 'published' ? 'success' : test.status === 'draft' ? 'warning' : 'neutral'"
            :label="t(`tests.admin.status.${test.status}`)"
          />
        </div>
        <p class="mt-2 font-mono text-xs break-all text-neutral-300">
          {{ test.code }} · {{ t('tests.admin.version', { version: test.version }) }}
        </p>
      </template>
      <p class="mt-2 max-w-2xl text-sm text-neutral-300">
        {{ t('tests.sections.intro') }}
      </p>
      <div class="mt-5 flex flex-wrap gap-3">
        <UButton
          data-test="questions-link"
          icon="i-lucide-list-checks"
          :to="localePath(`/dashboard/tests/${testId}/preguntas`)"
          :label="t('tests.questions.open')"
        />
        <UButton
          v-if="editable"
          data-test="import-open"
          color="neutral"
          variant="outline"
          class="text-white ring-white/30"
          icon="i-lucide-file-up"
          :label="t('tests.import.open')"
          @click="openImport"
        />
        <UButton
          v-if="canPublish"
          data-test="publish"
          color="success"
          icon="i-lucide-rocket"
          :loading="lifecycleBusy"
          :label="t('tests.publish.publish')"
          @click="onPublishClick"
        />
        <UButton
          v-if="canCreateVersion"
          data-test="new-version"
          icon="i-lucide-copy-plus"
          :loading="lifecycleBusy"
          :label="t('tests.publish.newVersion')"
          @click="onNewVersion"
        />
        <UButton
          v-if="canArchive"
          data-test="archive"
          color="neutral"
          variant="outline"
          class="text-white ring-white/30"
          icon="i-lucide-archive"
          :label="t('tests.publish.archive')"
          @click="openArchive"
        />
      </div>
    </section>

    <AdminTestsPublishErrors
      v-if="showPublishErrors && publishGroups.length"
      :groups="publishGroups"
    />

    <UAlert
      v-if="test?.status === 'archived'"
      data-test="archived"
      color="neutral"
      variant="soft"
      icon="i-lucide-archive"
      :title="t('tests.publish.archivedNotice')"
    />

    <UAlert
      v-if="test && !editable && test.status !== 'archived'"
      data-test="locked"
      color="warning"
      variant="soft"
      icon="i-lucide-lock"
      :title="t('tests.sections.locked')"
    />

    <AdminTestsSectionList
      :sections="sections"
      :pending="pending"
      :error="hasError"
      :editable="editable"
      @add="openForm(null)"
      @edit="openForm"
      @remove="toDelete = $event"
      @move="onMove"
      @retry="refresh()"
    />

    <UModal
      v-model:open="formOpen"
      :title="editing ? t('tests.sections.form.editTitle') : t('tests.sections.form.addTitle')"
    >
      <template #body>
        <UAlert
          v-if="formGeneral"
          role="alert"
          class="mb-4"
          color="error"
          variant="soft"
          icon="i-lucide-circle-alert"
          :title="t(`tests.sections.errors.${formGeneral}`)"
        />
        <DashboardManagementForm
          ref="form"
          :state="formState"
          :required="['code', 'titleEs', 'domain']"
          :validate="validateForm"
          :loading="saving"
          :submit-label="t('tests.sections.form.save')"
          @submit="onSave"
        >
          <UFormField
            name="code"
            :label="t('tests.sections.form.code')"
            :help="t('tests.sections.form.codeHelp')"
            required
          >
            <UInput
              v-model="formState.code"
              name="code"
              autocomplete="off"
              class="w-full font-mono uppercase"
            />
          </UFormField>
          <UFormField
            name="titleEs"
            :label="t('tests.sections.form.titleEs')"
            required
          >
            <UInput
              v-model="formState.titleEs"
              name="titleEs"
              class="w-full"
            />
          </UFormField>
          <UFormField
            name="titleEn"
            :label="t('tests.sections.form.titleEn')"
            :hint="t('tests.sections.form.optional')"
          >
            <UInput
              v-model="formState.titleEn"
              name="titleEn"
              class="w-full"
            />
          </UFormField>
          <UFormField
            name="domain"
            :label="t('tests.sections.form.domain')"
            :help="t('tests.sections.form.domainHelp')"
            required
          >
            <UInput
              v-model="formState.domain"
              name="domain"
              class="w-full"
            />
          </UFormField>

          <template #actions>
            <UButton
              color="neutral"
              variant="ghost"
              :label="t('tests.sections.form.cancel')"
              @click="closeForm"
            />
          </template>
        </DashboardManagementForm>
      </template>
    </UModal>

    <UModal
      v-model:open="confirmOpen"
      :title="t('tests.sections.confirm.title')"
      :description="confirmBody"
    >
      <template #footer>
        <div class="flex w-full flex-wrap justify-end gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            :label="t('tests.sections.confirm.cancel')"
            @click="cancelDelete"
          />
          <UButton
            color="error"
            :loading="deleting"
            :label="t('tests.sections.confirm.confirm')"
            @click="onConfirmDelete"
          />
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="publishOpen"
      :title="t('tests.publish.confirm.title')"
      :description="test && test.version > 1
        ? t('tests.publish.confirm.bodyReplaces', { version: test.version })
        : t('tests.publish.confirm.body', { version: test?.version ?? 1 })"
    >
      <template #footer>
        <div class="flex w-full flex-wrap justify-end gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            :label="t('tests.publish.confirm.cancel')"
            @click="closePublish"
          />
          <UButton
            data-test="confirm-publish"
            color="success"
            icon="i-lucide-rocket"
            :loading="lifecycleBusy"
            :label="t('tests.publish.confirm.confirm')"
            @click="onConfirmPublish"
          />
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="archiveOpen"
      :title="t('tests.publish.archiveConfirm.title')"
      :description="t('tests.publish.archiveConfirm.body', { version: test?.version ?? 1 })"
    >
      <template #footer>
        <div class="flex w-full flex-wrap justify-end gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            :label="t('tests.publish.archiveConfirm.cancel')"
            @click="closeArchive"
          />
          <UButton
            data-test="confirm-archive"
            color="error"
            icon="i-lucide-archive"
            :loading="lifecycleBusy"
            :label="t('tests.publish.archiveConfirm.confirm')"
            @click="onConfirmArchive"
          />
        </div>
      </template>
    </UModal>

    <AdminTestsImportDialog
      v-model:open="importOpen"
      :test-id="testId"
      @imported="onImported"
    />
  </div>
</template>
