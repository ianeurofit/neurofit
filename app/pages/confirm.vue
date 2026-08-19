<script setup lang="ts">
import { ROLE_HOME } from '~/types/user'

definePageMeta({ layout: false })

const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({ title: () => t('seo.confirm.title'), robots: 'noindex' })

const user = useSupabaseUser()
const { fetchProfile } = useProfile()

watch(user, async (value) => {
  if (!value) return
  const profile = await fetchProfile(true)
  await navigateTo(profile ? localePath(ROLE_HOME[profile.role]) : localePath('/login') + '?error=sin-perfil')
}, { immediate: true })
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-white dark:bg-ink-950">
    <div class="flex flex-col items-center gap-4">
      <UIcon
        name="i-lucide-loader-circle"
        class="size-8 animate-spin text-brand-500"
      />
      <p class="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
        {{ t('auth.confirm.checking') }}
      </p>
    </div>
  </div>
</template>
