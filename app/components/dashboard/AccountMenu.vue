<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { ROLE_COLORS } from '~/types/user'

const { t, locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const colorMode = useColorMode()
const router = useRouter()
const { profile, signOut } = useProfile()

const initials = computed(() => {
  const source = profile.value?.full_name || profile.value?.email || '?'
  return source.trim().slice(0, 2).toUpperCase()
})

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: profile.value?.full_name || t('dashboard.noName'),
      description: profile.value?.email,
      avatar: { text: initials.value },
      type: 'label',
    },
  ],
  [
    { label: t('nav.language'), type: 'label' },
    ...locales.value.map(l => ({
      label: l.name as string,
      type: 'checkbox' as const,
      checked: locale.value === l.code,
      onSelect: () => router.push(switchLocalePath(l.code)),
    })),
  ],
  [
    { label: t('nav.theme'), type: 'label' },
    {
      label: t('nav.themeLight'),
      icon: 'i-lucide-sun',
      type: 'checkbox',
      checked: colorMode.value === 'light',
      onSelect: () => { colorMode.preference = 'light' },
    },
    {
      label: t('nav.themeDark'),
      icon: 'i-lucide-moon',
      type: 'checkbox',
      checked: colorMode.value === 'dark',
      onSelect: () => { colorMode.preference = 'dark' },
    },
  ],
  [
    {
      label: t('dashboard.signOut'),
      icon: 'i-lucide-log-out',
      color: 'error',
      onSelect: () => signOut(),
    },
  ],
])
</script>

<template>
  <ClientOnly>
    <UDropdownMenu
      :items="items"
      :content="{ align: 'end', side: 'bottom', sideOffset: 8 }"
      :ui="{ content: 'w-64' }"
    >
      <UButton
        color="neutral"
        variant="ghost"
        class="rounded-full pl-1.5 pr-2.5"
        :aria-label="t('nav.accountMenu')"
      >
        <span class="flex size-8 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
          {{ initials }}
        </span>
        <span class="hidden max-w-[10rem] truncate text-sm font-semibold sm:inline">
          {{ profile?.full_name || profile?.email }}
        </span>
        <UBadge
          v-if="profile"
          :color="ROLE_COLORS[profile.role]"
          variant="soft"
          size="sm"
          class="hidden rounded-full md:inline-flex"
          :label="t(`roles.${profile.role}.label`)"
        />
        <UIcon
          name="i-lucide-chevron-down"
          class="size-4 text-neutral-400"
        />
      </UButton>
    </UDropdownMenu>

    <template #fallback>
      <div class="h-9 w-9 rounded-full bg-neutral-100 dark:bg-white/5" />
    </template>
  </ClientOnly>
</template>
