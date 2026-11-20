<script setup lang="ts">
import type { PublishError } from '#shared/utils/publish'

// HU007 CA-01: why a test cannot be published, grouped by section.

defineProps<{
  groups: Array<{ sectionCode: string | null, title: string | null, errors: Array<PublishError & { message: string }> }>
}>()

const { t } = useI18n()
</script>

<template>
  <section
    data-test="publish-errors"
    role="alert"
    aria-labelledby="publish-errors-title"
    class="rounded-2xl border border-error/40 bg-error/5 p-4 sm:p-6"
  >
    <div class="flex items-start gap-3">
      <UIcon
        name="i-lucide-circle-alert"
        class="mt-0.5 size-5 shrink-0 text-error"
      />
      <div class="min-w-0">
        <h3
          id="publish-errors-title"
          class="font-bold"
        >
          {{ t('tests.publish.errorsTitle') }}
        </h3>
        <p class="text-sm text-neutral-600 dark:text-neutral-300">
          {{ t('tests.publish.errorsHelp') }}
        </p>
      </div>
    </div>

    <ul class="mt-4 space-y-4">
      <li
        v-for="group in groups"
        :key="group.sectionCode ?? 'test'"
        data-test="publish-error-group"
      >
        <p class="text-sm font-semibold break-words">
          <template v-if="group.sectionCode">
            <span class="font-mono">{{ group.sectionCode }}</span>
            <span v-if="group.title"> · {{ group.title }}</span>
          </template>
          <template v-else>
            {{ t('tests.publish.general') }}
          </template>
        </p>
        <ul class="mt-1 space-y-1 ps-4">
          <li
            v-for="(error, index) in group.errors"
            :key="index"
            class="list-disc text-sm break-words text-neutral-700 dark:text-neutral-200"
          >
            <span
              v-if="error.questionCode"
              class="font-mono text-xs"
            >{{ t('tests.publish.question', { code: error.questionCode }) }}: </span>
            {{ error.message }}
          </li>
        </ul>
      </li>
    </ul>
  </section>
</template>
