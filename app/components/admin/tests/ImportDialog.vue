<script setup lang="ts">
import type { QuestionType } from '#shared/types/assessment'

// HU008: upload a Markdown file → preview with counts and errors → confirm. Nothing is saved
// before confirming, and nothing at all when the file has errors.

const props = defineProps<{ testId: string }>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ imported: [summary: { created: number, updated: number }] }>()

const { t } = useI18n()
const toast = useToast()

const importer = useTestImport(props.testId)
const { state, fileName, preview, plan, errors, general, canConfirm, changes } = importer

const input = useTemplateRef<HTMLInputElement>('file')
const busy = computed(() => ['reading', 'analyzing', 'importing'].includes(state.value))
const busyLabel = computed(() => t(`tests.import.${state.value === 'importing' ? 'importing' : state.value === 'reading' ? 'reading' : 'analyzing'}`))

const types = computed(() => Object.entries(preview.value?.byType ?? {}) as Array<[QuestionType, number]>)

async function loadFile(file: File) {
  await importer.load(file)
}

function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) loadFile(file)
}

function chooseFile() {
  input.value?.click()
}

function close() {
  open.value = false
}

async function onConfirm() {
  const created = plan.value?.questions.create ?? 0
  const updated = plan.value?.questions.update ?? 0
  const result = await importer.confirm()
  if (!result.ok) return

  toast.add({ title: t('tests.import.done', { created, updated }), color: 'success', icon: 'i-lucide-file-check' })
  emit('imported', { created, updated })
  open.value = false
  importer.reset()
}

defineExpose({ loadFile })
</script>

<template>
  <UModal
    v-model:open="open"
    :title="t('tests.import.title')"
    :description="t('tests.import.description')"
    :ui="{ content: 'sm:max-w-2xl' }"
  >
    <template #body>
      <div
        data-test="import-dialog"
        class="space-y-5"
      >
        <input
          ref="file"
          type="file"
          accept=".md,.markdown,text/markdown"
          class="sr-only"
          :aria-label="t('tests.import.choose')"
          @change="onFileChange"
        >

        <div
          v-if="state === 'empty'"
          data-test="import-empty"
          class="rounded-xl border border-dashed border-neutral-300 px-4 py-8 text-center dark:border-white/15"
        >
          <UIcon
            name="i-lucide-file-up"
            class="mx-auto size-8 text-neutral-400"
          />
          <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
            {{ t('tests.import.empty') }}
          </p>
          <UButton
            class="mt-4"
            icon="i-lucide-folder-open"
            :label="t('tests.import.choose')"
            @click="chooseFile"
          />
        </div>

        <div
          v-else-if="busy"
          data-test="import-loading"
          role="status"
          class="space-y-3"
          :aria-label="busyLabel"
        >
          <p class="text-sm text-neutral-600 dark:text-neutral-300">
            {{ busyLabel }}
          </p>
          <USkeleton class="h-24 w-full rounded-xl" />
        </div>

        <UAlert
          v-else-if="state === 'error'"
          role="alert"
          color="error"
          variant="soft"
          icon="i-lucide-circle-alert"
          :title="t('tests.import.error')"
          :description="general ? t(`tests.import.errors.${general}`) : undefined"
          :actions="[
            { label: t('tests.import.retry'), color: 'error', variant: 'outline', onClick: () => importer.retry() },
            { label: t('tests.import.change'), color: 'neutral', variant: 'ghost', onClick: chooseFile },
          ]"
        />

        <template v-else-if="preview">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="text-sm font-medium break-all">
              {{ t('tests.import.file', { name: fileName ?? '' }) }}
            </p>
            <UButton
              size="sm"
              color="neutral"
              variant="ghost"
              icon="i-lucide-refresh-cw"
              :label="t('tests.import.change')"
              @click="chooseFile"
            />
          </div>

          <section
            data-test="import-preview"
            class="space-y-4"
          >
            <p class="font-semibold">
              {{ t('tests.import.summary', { count: preview.total, sections: preview.sections.length }) }}
            </p>

            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <h4 class="text-sm font-semibold">
                  {{ t('tests.import.bySection') }}
                </h4>
                <ul class="mt-2 space-y-1 text-sm">
                  <li
                    v-for="section in preview.sections"
                    :key="section.code"
                    class="flex justify-between gap-3"
                  >
                    <span class="min-w-0 break-words"><span class="font-mono text-xs">{{ section.code }}</span> · {{ section.title }}</span>
                    <span class="shrink-0 tabular-nums">{{ section.count }}</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 class="text-sm font-semibold">
                  {{ t('tests.import.byType') }}
                </h4>
                <ul class="mt-2 space-y-1 text-sm">
                  <li
                    v-for="[type, count] in types"
                    :key="type"
                    data-test="import-type"
                    class="flex justify-between gap-3"
                  >
                    <span>{{ t(`tests.questions.types.${type}`) }}</span>
                    <span class="tabular-nums">{{ count }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div
              v-if="plan && !errors.length"
              data-test="import-plan"
              class="rounded-xl bg-neutral-50 p-3 text-sm dark:bg-white/5"
            >
              <h4 class="font-semibold">
                {{ t('tests.import.plan') }}
              </h4>
              <p class="mt-1">
                {{ t('tests.import.planCreate', { count: plan.questions.create }) }} ·
                {{ t('tests.import.planUpdate', { count: plan.questions.update }) }} ·
                {{ t('tests.import.planUnchanged', { count: plan.questions.unchanged }) }}
              </p>
              <p class="mt-1 text-neutral-600 dark:text-neutral-300">
                {{ t('tests.import.sectionsPlan', { create: plan.sections.create, update: plan.sections.update }) }}
              </p>
              <p
                v-if="plan.questions.untouched"
                class="mt-1 text-neutral-600 dark:text-neutral-300"
              >
                {{ t('tests.import.planUntouched', { count: plan.questions.untouched }) }}
              </p>
              <p
                v-if="!changes"
                class="mt-1 font-medium"
              >
                {{ t('tests.import.nothingToDo') }}
              </p>
            </div>
          </section>

          <section
            v-if="errors.length"
            data-test="import-errors"
            role="alert"
            class="rounded-xl border border-error/40 bg-error/5 p-3"
          >
            <p class="text-sm font-semibold">
              {{ t('tests.import.errorsTitle') }}
            </p>
            <ul class="mt-2 max-h-64 space-y-1 overflow-y-auto text-sm">
              <li
                v-for="(error, index) in errors"
                :key="index"
                class="break-words"
              >
                <span class="font-mono text-xs">{{ t('tests.import.line', { line: error.line }) }}</span>
                <span
                  v-if="error.questionCode"
                  class="font-mono text-xs"
                > · {{ error.questionCode }}</span>
                — {{ error.message }}
              </li>
            </ul>
          </section>
        </template>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full flex-wrap justify-end gap-3">
        <UButton
          color="neutral"
          variant="ghost"
          :label="t('tests.import.cancel')"
          @click="close"
        />
        <UButton
          data-test="import-confirm"
          icon="i-lucide-file-check"
          :loading="state === 'importing'"
          :disabled="!canConfirm"
          :label="t('tests.import.confirm')"
          @click="onConfirm"
        />
      </div>
    </template>
  </UModal>
</template>
