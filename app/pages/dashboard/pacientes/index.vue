<script setup lang="ts">
definePageMeta({ layout: 'dashboard', titleKey: 'dashboard.titles.patients' })

const { t, locale } = useI18n()

useSeoMeta({ title: () => t('seo.patients.title'), robots: 'noindex' })

const { search, patients, filtered, pending, hasError, refresh } = useAssignedPatients()

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(locale.value === 'en' ? 'en-US' : 'es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="space-y-8">
    <section class="rounded-2xl bg-ink-950 p-6 text-white ring-1 ring-white/10 sm:p-8">
      <p class="section-eyebrow text-brand-400">
        {{ t('patients.eyebrow') }}
      </p>
      <h2 class="mt-3 text-2xl font-extrabold sm:text-3xl">
        {{ t('patients.title') }}
      </h2>
      <p class="mt-2 max-w-2xl text-sm text-neutral-300">
        {{ t('patients.intro') }}
      </p>
    </section>

    <section class="rounded-2xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-ink-900">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-4 py-4 sm:px-6 dark:border-white/10">
        <h3 class="font-bold">
          {{ t('patients.listTitle') }}
          <span
            v-if="!pending && !hasError"
            class="ml-1 text-sm font-medium text-neutral-500"
          >({{ patients.length }})</span>
        </h3>
        <UInput
          v-model="search"
          icon="i-lucide-search"
          :placeholder="t('patients.search')"
          :aria-label="t('patients.search')"
          class="w-full sm:w-72"
        />
      </div>

      <div
        v-if="pending"
        class="space-y-3 px-4 py-6 sm:px-6"
        role="status"
        :aria-label="t('dashboard.loading')"
      >
        <USkeleton
          v-for="n in 3"
          :key="n"
          class="h-12 w-full rounded-xl"
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
          :title="t('patients.error')"
          :actions="[{ label: t('patients.retry'), color: 'error', variant: 'outline', onClick: () => refresh() }]"
        />
      </div>

      <ul
        v-else-if="filtered.length"
        class="divide-y divide-neutral-200 dark:divide-white/10"
      >
        <li
          v-for="patient in filtered"
          :key="patient.id"
          class="flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-6"
        >
          <div class="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
            {{ (patient.full_name || patient.email).slice(0, 2).toUpperCase() }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold">
              {{ patient.full_name || t('dashboard.noName') }}
            </p>
            <p class="truncate text-xs text-neutral-500">
              {{ patient.email }}
            </p>
          </div>
          <span class="hidden text-xs text-neutral-500 sm:block">
            {{ t('patients.since', { date: formatDate(patient.assigned_at) }) }}
          </span>
          <UBadge
            :color="patient.is_active ? 'primary' : 'neutral'"
            variant="soft"
            class="shrink-0 rounded-full"
            :label="patient.is_active ? t('patients.active') : t('patients.inactive')"
          />
        </li>
      </ul>

      <div
        v-else
        class="px-4 py-10 text-center sm:px-6"
      >
        <UIcon
          name="i-lucide-users-round"
          class="mx-auto size-8 text-neutral-400"
        />
        <p class="mt-3 text-sm font-medium">
          {{ patients.length ? t('patients.emptySearch') : t('patients.empty') }}
        </p>
        <p
          v-if="!patients.length"
          class="mt-1 text-sm text-neutral-500"
        >
          {{ t('patients.emptyHint') }}
        </p>
      </div>
    </section>
  </div>
</template>
