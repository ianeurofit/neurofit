<script setup lang="ts">
import { ROLE_COLORS, type UserRole } from '~/types/user'

const { t } = useI18n()
const localePath = useLocalePath()
const { profile, signOut } = useProfile()

interface NavItem {
  key: string
  icon: string
  to: string
}

const NAV: Record<UserRole, NavItem[]> = {
  superuser: [
    { key: 'overview', icon: 'i-lucide-layout-dashboard', to: '/dashboard/superusuario' },
    { key: 'users', icon: 'i-lucide-users', to: '/dashboard/usuarios' },
    { key: 'newUser', icon: 'i-lucide-user-plus', to: '/dashboard/usuarios/nuevo' },
    { key: 'roadmap', icon: 'i-lucide-map', to: '/dashboard/roadmap' },
    { key: 'demo', icon: 'i-lucide-monitor-play', to: '/demo' },
  ],
  evaluator: [
    { key: 'overview', icon: 'i-lucide-layout-dashboard', to: '/dashboard/evaluador' },
    { key: 'roadmap', icon: 'i-lucide-map', to: '/dashboard/roadmap' },
  ],
  user: [
    { key: 'myPanel', icon: 'i-lucide-brain', to: '/dashboard/usuario' },
  ],
}

const items = computed(() =>
  (profile.value ? NAV[profile.value.role] : []).map(item => ({
    ...item,
    label: t(`dashboard.nav.${item.key}`),
    path: localePath(item.to),
  })),
)
const initials = computed(() => {
  const source = profile.value?.full_name || profile.value?.email || '?'
  return source.trim().slice(0, 2).toUpperCase()
})

const mobileOpen = ref(false)
const route = useRoute()

const pageTitle = computed(() =>
  route.meta.titleKey ? t(String(route.meta.titleKey)) : t('dashboard.defaultTitle'),
)

watch(() => route.fullPath, () => {
  mobileOpen.value = false
})
</script>

<template>
  <div class="min-h-screen bg-neutral-50 dark:bg-ink-950">
    <div class="mx-auto flex max-w-[1600px]">
      <!-- Barra lateral -->
      <aside
        class="fixed inset-y-0 left-0 z-50 w-72 shrink-0 border-r border-neutral-200 bg-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 dark:border-white/10 dark:bg-ink-900"
        :class="mobileOpen ? 'translate-x-0' : '-translate-x-full'"
      >
        <div class="flex h-full flex-col">
          <div class="flex h-20 items-center justify-between border-b border-neutral-200 px-6 dark:border-white/10">
            <NuxtLink :to="localePath('/')">
              <NuxtImg
                src="/logo-teal-gray.svg"
                alt="Neurofit IA"
                class="h-8 w-auto"
              />
            </NuxtLink>
            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              class="lg:hidden"
              :aria-label="t('nav.closeMenu')"
              @click="mobileOpen = false"
            />
          </div>

          <nav class="flex-1 space-y-1 p-4">
            <NuxtLink
              v-for="item in items"
              :key="item.to"
              :to="item.path"
              class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-neutral-600 transition-colors hover:bg-brand-50 hover:text-brand-700 dark:text-neutral-300 dark:hover:bg-brand-900/30 dark:hover:text-brand-300"
              active-class="bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
            >
              <UIcon
                :name="item.icon"
                class="size-5"
              />
              {{ item.label }}
            </NuxtLink>
          </nav>

          <div class="border-t border-neutral-200 p-4 dark:border-white/10">
            <div class="flex items-center gap-3 rounded-xl bg-neutral-50 p-3 dark:bg-white/5">
              <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
                {{ initials }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold">
                  {{ profile?.full_name || t('dashboard.noName') }}
                </p>
                <p class="truncate text-xs text-neutral-500">
                  {{ profile?.email }}
                </p>
              </div>
            </div>

            <UBadge
              v-if="profile"
              :color="ROLE_COLORS[profile.role]"
              variant="soft"
              class="mt-3 w-full justify-center rounded-full"
              :label="t(`roles.${profile.role}.label`)"
            />

            <UButton
              icon="i-lucide-log-out"
              :label="t('dashboard.signOut')"
              color="neutral"
              variant="ghost"
              block
              class="mt-2 justify-start rounded-xl"
              @click="signOut()"
            />
          </div>
        </div>
      </aside>

      <div
        v-if="mobileOpen"
        class="fixed inset-0 z-40 bg-black/40 lg:hidden"
        @click="mobileOpen = false"
      />

      <!-- Contenido -->
      <div class="flex min-w-0 flex-1 flex-col">
        <header
          class="sticky top-0 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-ink-950/80"
        >
          <div class="flex h-20 items-center justify-between gap-4 px-4 sm:px-8">
            <UButton
              icon="i-lucide-menu"
              color="neutral"
              variant="ghost"
              class="lg:hidden"
              :aria-label="t('nav.openMenu')"
              @click="mobileOpen = true"
            />

            <div class="min-w-0">
              <p class="section-eyebrow">
                {{ t('dashboard.eyebrow') }}
              </p>
              <h1 class="truncate text-lg font-extrabold tracking-tight">
                {{ pageTitle }}
              </h1>
            </div>

            <div class="flex items-center gap-3">
              <DashboardAccountMenu />
            </div>
          </div>
        </header>

        <main class="flex-1 px-4 py-8 sm:px-8">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>
