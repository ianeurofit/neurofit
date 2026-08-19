<script setup lang="ts">
import type { Profile } from '~/types/user'

definePageMeta({ layout: 'dashboard', titleKey: 'dashboard.titles.evaluator' })

const { t, locale } = useI18n()

useSeoMeta({ title: () => t('seo.evaluator.title'), robots: 'noindex' })

const client = useSupabaseClient()
const { profile } = useProfile()

// El evaluador puede leer los perfiles gracias a la politica RLS "profiles_select_staff"
const { data: users, pending } = await useAsyncData('evaluator-profiles', async () => {
  const { data } = await client
    .from('profiles')
    .select('*')
    .eq('role', 'user')
    .order('created_at', { ascending: false })
  return (data ?? []) as Profile[]
})

const search = ref('')
const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  const list = users.value ?? []
  if (!term) return list
  return list.filter(u =>
    u.email.toLowerCase().includes(term)
    || (u.full_name ?? '').toLowerCase().includes(term))
})

const activeCount = computed(() => (users.value ?? []).filter(u => u.is_active).length)

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
    <section class="rounded-2xl bg-ink-950 p-8 text-white ring-1 ring-white/10">
      <p class="section-eyebrow text-brand-400">
        {{ t('dashboard.evaluator.eyebrow') }}
      </p>
      <h2 class="mt-3 text-2xl font-extrabold sm:text-3xl">
        {{ t('dashboard.evaluator.greeting', { name: profile?.full_name || t('dashboard.evaluator.greetingFallback') }) }}
      </h2>
      <p class="mt-2 max-w-2xl text-sm text-neutral-300">
        {{ t('dashboard.evaluator.intro') }}
      </p>
    </section>

    <section class="grid gap-4 sm:grid-cols-3">
      <DashboardStatCard
        :label="t('dashboard.evaluator.registered')"
        :value="users?.length ?? 0"
        icon="i-lucide-users"
      />
      <DashboardStatCard
        :label="t('dashboard.evaluator.active')"
        :value="activeCount"
        icon="i-lucide-user-check"
      />
      <DashboardStatCard
        :label="t('dashboard.evaluator.role')"
        :value="t('roles.evaluator.label')"
        icon="i-lucide-clipboard-check"
      />
    </section>

    <section class="rounded-2xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-ink-900">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-6 py-4 dark:border-white/10">
        <h3 class="font-bold">
          {{ t('dashboard.evaluator.listTitle') }}
        </h3>
        <UInput
          v-model="search"
          icon="i-lucide-search"
          :placeholder="t('dashboard.evaluator.search')"
          class="w-full sm:w-72"
        />
      </div>

      <div
        v-if="pending"
        class="px-6 py-8 text-sm text-neutral-500"
      >
        {{ t('dashboard.loading') }}
      </div>
      <ul
        v-else-if="filtered.length"
        class="divide-y divide-neutral-200 dark:divide-white/10"
      >
        <li
          v-for="item in filtered"
          :key="item.id"
          class="flex items-center gap-4 px-6 py-4"
        >
          <div class="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
            {{ (item.full_name || item.email).slice(0, 2).toUpperCase() }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold">
              {{ item.full_name || t('dashboard.noName') }}
            </p>
            <p class="truncate text-xs text-neutral-500">
              {{ item.email }}
            </p>
          </div>
          <span class="hidden text-xs text-neutral-500 sm:block">
            {{ t('dashboard.evaluator.since', { date: formatDate(item.created_at) }) }}
          </span>
          <UBadge
            :color="item.is_active ? 'primary' : 'neutral'"
            variant="soft"
            class="rounded-full"
            :label="item.is_active ? t('dashboard.evaluator.activeBadge') : t('dashboard.evaluator.inactiveBadge')"
          />
        </li>
      </ul>
      <p
        v-else
        class="px-6 py-8 text-sm text-neutral-500"
      >
        {{ t('dashboard.evaluator.empty') }}
      </p>
    </section>
  </div>
</template>
