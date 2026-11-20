<script setup lang="ts" generic="T extends Record<string, any>">
import type { TableColumn } from '@nuxt/ui'

const props = defineProps<{
  columns: TableColumn<T>[]
  items: T[]
  pending: boolean
  error: boolean
  hasFilters: boolean
}>()

const emit = defineEmits<{ retry: [], clearFilters: [] }>()

const { t } = useI18n()

const state = computed(() => resolveListState({
  pending: props.pending,
  error: props.error,
  count: props.items.length,
  hasFilters: props.hasFilters,
}))
</script>

<template>
  <section class="rounded-2xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-ink-900">
    <div
      v-if="$slots.filters || hasFilters"
      class="space-y-4 border-b border-neutral-200 px-4 py-4 sm:px-6 dark:border-white/10"
    >
      <slot name="filters" />
      <UButton
        v-if="hasFilters"
        data-test="clear-filters"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-lucide-x"
        :label="t('management.clearFilters')"
        @click="emit('clearFilters')"
      />
    </div>

    <div
      v-if="state === 'loading'"
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
      v-else-if="state === 'error'"
      class="px-4 py-6 sm:px-6"
    >
      <UAlert
        role="alert"
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        :title="t('management.error')"
        :actions="[{ label: t('management.retry'), color: 'error', variant: 'outline', onClick: () => emit('retry') }]"
      />
    </div>

    <div
      v-else-if="state === 'ready'"
    >
      <div
        data-test="table"
        class="hidden overflow-x-auto sm:block"
      >
        <UTable
          :data="items"
          :columns="columns"
        >
          <template
            v-for="(_, slotName) in $slots"
            #[slotName]="slotProps"
          >
            <slot
              v-if="String(slotName).endsWith('-cell') || String(slotName).endsWith('-header')"
              :name="slotName"
              v-bind="slotProps"
            />
          </template>
        </UTable>
      </div>

      <ul
        data-test="cards"
        class="divide-y divide-neutral-200 sm:hidden dark:divide-white/10"
      >
        <li
          v-for="(item, index) in items"
          :key="index"
          data-test="card"
          class="px-4 py-4"
        >
          <slot
            name="card"
            :item="item"
          />
        </li>
      </ul>
    </div>

    <div
      v-else
      class="px-4 py-10 text-center sm:px-6"
    >
      <UIcon
        name="i-lucide-inbox"
        class="mx-auto size-8 text-neutral-400"
      />
      <div class="mt-3">
        <slot
          v-if="state === 'empty' && $slots.empty"
          name="empty"
        />
        <p
          v-else
          class="text-sm font-medium"
        >
          {{ state === 'emptyFiltered' ? t('management.emptyFiltered') : t('management.empty') }}
        </p>
      </div>
    </div>

    <slot name="footer" />
  </section>
</template>
