<script setup lang="ts">
import type { TestFormState } from '#shared/utils/tests'

definePageMeta({ layout: 'dashboard', titleKey: 'dashboard.titles.testsNew' })

const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

useSeoMeta({ title: () => t('seo.testsNew.title'), robots: 'noindex' })

const { create, errorMessage, validateForm } = useAdminTests()

const state = reactive<TestFormState>({ code: '', titleEs: '', titleEn: '', descriptionEs: '', descriptionEn: '' })
const saving = ref(false)
const generalError = ref<'unknown' | 'forbidden' | null>(null)
const form = useTemplateRef<{ setErrors: (errors: { name: string, message: string }[]) => void }>('form')

const listPath = computed(() => localePath('/dashboard/tests'))

async function onSubmit() {
  saving.value = true
  generalError.value = null

  const result = await create(state)

  saving.value = false

  if (result.ok) {
    toast.add({ title: t('tests.admin.form.created'), color: 'success', icon: 'i-lucide-check' })
    await navigateTo(listPath.value)
    return
  }

  if (result.general) generalError.value = result.general
  form.value?.setErrors(result.errors.map(error => ({
    name: testErrorToFormField(error.field),
    message: errorMessage(error),
  })))
}
</script>

<template>
  <div class="space-y-8">
    <section class="rounded-2xl bg-ink-950 p-6 text-white ring-1 ring-white/10 sm:p-8">
      <p class="section-eyebrow text-brand-400">
        {{ t('tests.admin.form.eyebrow') }}
      </p>
      <h2 class="mt-3 text-2xl font-extrabold sm:text-3xl">
        {{ t('tests.admin.form.title') }}
      </h2>
      <p class="mt-2 max-w-2xl text-sm text-neutral-300">
        {{ t('tests.admin.form.intro') }}
      </p>
    </section>

    <section class="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 dark:border-white/10 dark:bg-ink-900">
      <UAlert
        v-if="generalError"
        role="alert"
        class="mb-5"
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        :title="t(`errors.test.${generalError}`)"
      />

      <DashboardManagementForm
        ref="form"
        :state="state"
        :required="['code', 'titleEs']"
        :validate="validateForm"
        :loading="saving"
        :submit-label="t('tests.admin.form.save')"
        @submit="onSubmit"
      >
        <div class="grid gap-5 sm:grid-cols-2">
          <UFormField
            name="code"
            :label="t('tests.admin.form.code')"
            :help="t('tests.admin.form.codeHelp')"
            required
            class="sm:col-span-2"
          >
            <UInput
              v-model="state.code"
              name="code"
              autocomplete="off"
              class="w-full font-mono uppercase"
            />
          </UFormField>

          <UFormField
            name="titleEs"
            :label="t('tests.admin.form.titleEs')"
            required
          >
            <UInput
              v-model="state.titleEs"
              name="titleEs"
              class="w-full"
            />
          </UFormField>
          <UFormField
            name="titleEn"
            :label="t('tests.admin.form.titleEn')"
            :hint="t('tests.admin.form.optional')"
          >
            <UInput
              v-model="state.titleEn"
              name="titleEn"
              class="w-full"
            />
          </UFormField>

          <UFormField
            name="descriptionEs"
            :label="t('tests.admin.form.descriptionEs')"
            :hint="t('tests.admin.form.optional')"
          >
            <UTextarea
              v-model="state.descriptionEs"
              name="descriptionEs"
              :rows="4"
              class="w-full"
            />
          </UFormField>
          <UFormField
            name="descriptionEn"
            :label="t('tests.admin.form.descriptionEn')"
            :hint="t('tests.admin.form.optional')"
          >
            <UTextarea
              v-model="state.descriptionEn"
              name="descriptionEn"
              :rows="4"
              class="w-full"
            />
          </UFormField>
        </div>

        <template #actions>
          <UButton
            :to="listPath"
            color="neutral"
            variant="ghost"
            :label="t('tests.admin.form.cancel')"
          />
        </template>
      </DashboardManagementForm>
    </section>
  </div>
</template>
