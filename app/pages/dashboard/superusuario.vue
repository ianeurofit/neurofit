<script setup lang="ts">
import type { Profile, UserRole } from '~/types/user'

definePageMeta({ layout: 'dashboard', titleKey: 'dashboard.titles.superuser' })

const { t, locale } = useI18n()
const localePath = useLocalePath()

useSeoMeta({ title: () => t('seo.superuser.title'), robots: 'noindex' })

const client = useSupabaseClient()
const { profile } = useProfile()

const { data: users, pending } = await useAsyncData('superuser-profiles', async () => {
  const { data } = await client
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  return (data ?? []) as Profile[]
})

const total = computed(() => users.value?.length ?? 0)
const byRole = computed(() => {
  const counts: Record<UserRole, number> = { superuser: 0, evaluator: 0, user: 0 }
  for (const item of users.value ?? []) counts[item.role]++
  return counts
})
const inactive = computed(() => (users.value ?? []).filter(u => !u.is_active).length)
const latest = computed(() => (users.value ?? []).slice(0, 5))

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
        {{ t('dashboard.superuser.eyebrow') }}
      </p>
      <h2 class="mt-3 text-2xl font-extrabold sm:text-3xl">
        {{ t('dashboard.superuser.greeting', { name: profile?.full_name || t('dashboard.superuser.greetingFallback') }) }}
      </h2>
      <p class="mt-2 max-w-2xl text-sm text-neutral-300">
        {{ t('dashboard.superuser.intro') }}
      </p>
      <div class="mt-6 flex flex-wrap gap-3">
        <UButton
          :to="localePath('/dashboard/usuarios')"
          :label="t('dashboard.superuser.manageUsers')"
          color="primary"
          class="rounded-full"
          icon="i-lucide-users"
        />
        <UButton
          :to="localePath('/dashboard/usuarios/nuevo')"
          :label="t('dashboard.superuser.createUser')"
          color="neutral"
          variant="outline"
          class="rounded-full"
          icon="i-lucide-user-plus"
        />
      </div>
    </section>

    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <DashboardStatCard
        :label="t('dashboard.superuser.totalUsers')"
        :value="total"
        icon="i-lucide-users"
      />
      <DashboardStatCard
        :label="t('dashboard.superuser.superusers')"
        :value="byRole.superuser"
        icon="i-lucide-shield-check"
      />
      <DashboardStatCard
        :label="t('dashboard.superuser.evaluators')"
        :value="byRole.evaluator"
        icon="i-lucide-clipboard-check"
      />
      <DashboardStatCard
        :label="t('dashboard.superuser.inactive')"
        :value="inactive"
        icon="i-lucide-user-x"
      />
    </section>

    <section class="rounded-2xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-ink-900">
      <div class="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-white/10">
        <h3 class="font-bold">
          Últimos registros
        </h3>
        <UButton
          :to="localePath('/dashboard/usuarios')"
          :label="t('dashboard.superuser.seeAll')"
          variant="link"
          color="primary"
          trailing-icon="i-lucide-arrow-right"
        />
      </div>

      <div
        v-if="pending"
        class="px-6 py-8 text-sm text-neutral-500"
      >
        {{ t('dashboard.loading') }}
      </div>
      <ul
        v-else-if="latest.length"
        class="divide-y divide-neutral-200 dark:divide-white/10"
      >
        <li
          v-for="item in latest"
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
          <span class="hidden text-xs text-neutral-500 sm:block">{{ formatDate(item.created_at) }}</span>
          <UBadge
            variant="soft"
            color="neutral"
            class="rounded-full"
            :label="t(`roles.${item.role}.label`)"
          />
        </li>
      </ul>
      <p
        v-else
        class="px-6 py-8 text-sm text-neutral-500"
      >
        {{ t('dashboard.superuser.empty') }}
      </p>
    </section>
  </div>
</template>
