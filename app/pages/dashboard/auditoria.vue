<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { AuditItem } from '~/composables/useAuditLog'

definePageMeta({ layout: 'dashboard', titleKey: 'dashboard.titles.audit' })

const { t, te, locale } = useI18n()

useSeoMeta({ title: () => t('seo.audit.title'), robots: 'noindex' })

const {
  filters, items, total, pages, pageSize, pending, hasError, hasFilters,
  clearFilters, refresh, actorOptions, entityOptions,
} = useAuditLog()

const columns = computed<TableColumn<AuditItem>[]>(() => [
  { accessorKey: 'created_at', header: t('audit.columns.date') },
  { accessorKey: 'actor', header: t('audit.columns.actor') },
  { accessorKey: 'action', header: t('audit.columns.action') },
  { accessorKey: 'entity', header: t('audit.columns.entity') },
  { accessorKey: 'diff', header: t('audit.columns.changes') },
])

const ACTION_COLORS = { insert: 'success', update: 'warning', delete: 'error' } as const

function formatDate(value: string) {
  return new Date(value).toLocaleString(locale.value === 'en' ? 'en-US' : 'es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function entityLabel(entity: string) {
  return te(`audit.entities.${entity}`) ? t(`audit.entities.${entity}`) : entity
}
</script>

<template>
  <div class="space-y-8">
    <section class="rounded-2xl bg-ink-950 p-6 text-white ring-1 ring-white/10 sm:p-8">
      <p class="section-eyebrow text-brand-400">
        {{ t('audit.eyebrow') }}
      </p>
      <h2 class="mt-3 text-2xl font-extrabold sm:text-3xl">
        {{ t('audit.title') }}
      </h2>
      <p class="mt-2 max-w-2xl text-sm text-neutral-300">
        {{ t('audit.intro') }}
      </p>
    </section>

    <section class="rounded-2xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-ink-900">
      <div class="space-y-4 border-b border-neutral-200 px-4 py-4 sm:px-6 dark:border-white/10">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h3 class="font-bold">
            {{ t('audit.listTitle') }}
          </h3>
          <span
            v-if="!pending && !hasError"
            class="text-sm text-neutral-500"
          >{{ t('audit.total', { count: total }) }}</span>
        </div>

        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <UFormField :label="t('audit.filters.entity')">
            <USelect
              v-model="filters.entity"
              :items="entityOptions"
              class="w-full"
            />
          </UFormField>
          <UFormField :label="t('audit.filters.actor')">
            <USelect
              v-model="filters.actor"
              :items="actorOptions"
              class="w-full"
            />
          </UFormField>
          <UFormField :label="t('audit.filters.from')">
            <UInput
              v-model="filters.from"
              type="date"
              :max="filters.to || undefined"
              class="w-full"
            />
          </UFormField>
          <UFormField :label="t('audit.filters.to')">
            <UInput
              v-model="filters.to"
              type="date"
              :min="filters.from || undefined"
              class="w-full"
            />
          </UFormField>
        </div>

        <UButton
          v-if="hasFilters"
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-x"
          :label="t('audit.filters.clear')"
          @click="clearFilters"
        />
      </div>

      <div
        v-if="pending"
        class="space-y-3 px-4 py-6 sm:px-6"
        role="status"
        :aria-label="t('dashboard.loading')"
      >
        <USkeleton
          v-for="n in 5"
          :key="n"
          class="h-10 w-full rounded-xl"
        />
      </div>

      <div
        v-else-if="hasError"
        class="px-4 py-6 sm:px-6"
      >
        <UAlert
          color="error"
          variant="soft"
          icon="i-lucide-circle-alert"
          :title="t('audit.error')"
          :actions="[{ label: t('audit.retry'), color: 'error', variant: 'outline', onClick: () => refresh() }]"
        />
      </div>

      <div
        v-else-if="items.length"
        class="overflow-x-auto"
      >
        <UTable
          :data="items"
          :columns="columns"
          class="min-w-[44rem]"
        >
          <template #created_at-cell="{ row }">
            <span class="whitespace-nowrap text-xs">{{ formatDate(row.original.created_at) }}</span>
          </template>
          <template #actor-cell="{ row }">
            <span class="text-sm">{{ row.original.actor?.full_name || row.original.actor?.email || t('audit.system') }}</span>
          </template>
          <template #action-cell="{ row }">
            <UBadge
              :color="ACTION_COLORS[row.original.action]"
              variant="soft"
              class="rounded-full"
              :label="t(`audit.actions.${row.original.action}`)"
            />
          </template>
          <template #entity-cell="{ row }">
            <span class="text-sm">{{ entityLabel(row.original.entity) }}</span>
          </template>
          <template #diff-cell="{ row }">
            <span class="block max-w-md break-words font-mono text-xs text-neutral-600 dark:text-neutral-400">
              {{ summarizeDiff(row.original.diff) }}
            </span>
          </template>
        </UTable>
      </div>

      <div
        v-else
        class="px-4 py-10 text-center sm:px-6"
      >
        <UIcon
          name="i-lucide-history"
          class="mx-auto size-8 text-neutral-400"
        />
        <p class="mt-3 text-sm font-medium">
          {{ hasFilters ? t('audit.emptyFiltered') : t('audit.empty') }}
        </p>
      </div>

      <div
        v-if="!pending && !hasError && pages > 1"
        class="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-4 py-4 sm:px-6 dark:border-white/10"
      >
        <span class="text-sm text-neutral-500">{{ t('audit.pageOf', { page: filters.page, pages }) }}</span>
        <UPagination
          v-model:page="filters.page"
          :total="total"
          :items-per-page="pageSize"
          :sibling-count="1"
        />
      </div>
    </section>
  </div>
</template>
