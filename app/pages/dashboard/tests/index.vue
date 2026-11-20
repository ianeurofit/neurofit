<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { TestStatus, TestSummary } from '#shared/types/assessment'

definePageMeta({ layout: 'dashboard', titleKey: 'dashboard.titles.tests' })

const { t, locale } = useI18n()
const localePath = useLocalePath()

useSeoMeta({ title: () => t('seo.tests.title'), robots: 'noindex' })

const { tests, filter, statusOptions, pending, hasError, hasFilters, clearFilters, refresh } = useAdminTests()

const columns = computed<TableColumn<TestSummary>[]>(() => [
  { accessorKey: 'code', header: t('tests.admin.columns.code') },
  { accessorKey: 'title', header: t('tests.admin.columns.title') },
  { accessorKey: 'version', header: t('tests.admin.columns.version') },
  { accessorKey: 'status', header: t('tests.admin.columns.status') },
])

const STATUS_COLORS: Record<TestStatus, 'neutral' | 'success' | 'warning'> = {
  draft: 'warning',
  published: 'success',
  archived: 'neutral',
}

const newTestPath = computed(() => localePath('/dashboard/tests/nuevo'))
</script>

<template>
  <div class="space-y-8">
    <section class="rounded-2xl bg-ink-950 p-6 text-white ring-1 ring-white/10 sm:p-8">
      <p class="section-eyebrow text-brand-400">
        {{ t('tests.admin.eyebrow') }}
      </p>
      <div class="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 class="text-2xl font-extrabold sm:text-3xl">
            {{ t('tests.admin.title') }}
          </h2>
          <p class="mt-2 max-w-2xl text-sm text-neutral-300">
            {{ t('tests.admin.intro') }}
          </p>
        </div>
        <UButton
          :to="newTestPath"
          icon="i-lucide-plus"
          :label="t('tests.admin.new')"
        />
      </div>
    </section>

    <DashboardManagementList
      :columns="columns"
      :items="tests"
      :pending="pending"
      :error="hasError"
      :has-filters="hasFilters"
      @retry="refresh()"
      @clear-filters="clearFilters"
    >
      <template #filters>
        <div class="flex flex-wrap items-end justify-between gap-3">
          <UFormField
            :label="t('tests.admin.filters.status')"
            class="w-full sm:w-64"
          >
            <USelect
              v-model="filter.status"
              :items="statusOptions"
              class="w-full"
            />
          </UFormField>
          <span
            v-if="!pending && !hasError"
            class="text-sm text-neutral-500"
          >{{ t('tests.admin.total', { count: tests.length }) }}</span>
        </div>
      </template>

      <template #code-cell="{ row }">
        <NuxtLink
          :to="localePath(`/dashboard/tests/${row.original.id}`)"
          class="font-mono text-xs font-semibold text-brand-600 underline-offset-2 hover:underline dark:text-brand-400"
        >
          {{ row.original.code }}
        </NuxtLink>
      </template>
      <template #title-cell="{ row }">
        <span class="text-sm">{{ localizedText(row.original.title, locale) }}</span>
      </template>
      <template #version-cell="{ row }">
        <span class="text-sm">{{ t('tests.admin.version', { version: row.original.version }) }}</span>
      </template>
      <template #status-cell="{ row }">
        <UBadge
          :color="STATUS_COLORS[row.original.status]"
          variant="soft"
          class="rounded-full"
          :label="t(`tests.admin.status.${row.original.status}`)"
        />
      </template>

      <template #card="{ item }">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <NuxtLink
              :to="localePath(`/dashboard/tests/${item.id}`)"
              class="font-mono text-xs font-semibold break-all text-brand-600 underline-offset-2 hover:underline dark:text-brand-400"
            >
              {{ item.code }}
            </NuxtLink>
            <p class="mt-1 text-sm font-medium">
              {{ localizedText(item.title, locale) }}
            </p>
            <p class="mt-1 text-xs text-neutral-500">
              {{ t('tests.admin.columns.version') }}: {{ t('tests.admin.version', { version: item.version }) }}
            </p>
          </div>
          <UBadge
            :color="STATUS_COLORS[item.status as TestStatus]"
            variant="soft"
            class="shrink-0 rounded-full"
            :label="t(`tests.admin.status.${item.status}`)"
          />
        </div>
      </template>

      <template
        v-if="!hasFilters"
        #empty
      >
        <p class="text-sm font-medium">
          {{ t('tests.admin.empty') }}
        </p>
        <UButton
          :to="newTestPath"
          class="mt-4"
          icon="i-lucide-plus"
          :label="t('tests.admin.new')"
        />
      </template>
    </DashboardManagementList>
  </div>
</template>
