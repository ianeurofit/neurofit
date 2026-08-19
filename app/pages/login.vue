<script setup lang="ts">
import { ROLE_HOME } from '~/types/user'

definePageMeta({ layout: false })

const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: () => t('seo.login.title'),
  description: () => t('seo.login.description'),
  robots: 'noindex',
})

const client = useSupabaseClient()
const route = useRoute()
const toast = useToast()
const { fetchProfile } = useProfile()

const state = reactive({ email: '', password: '' })
const loading = ref(false)
const errorMessage = ref('')

const notices: Record<string, string> = {
  'sin-perfil': 'auth.login.noticeNoProfile',
  'cuenta-inactiva': 'auth.login.noticeInactive',
}

const notice = computed(() => {
  const key = notices[String(route.query.error ?? '')]
  return key ? t(key) : ''
})

async function onSubmit() {
  loading.value = true
  errorMessage.value = ''

  const { error } = await client.auth.signInWithPassword({
    email: state.email.trim().toLowerCase(),
    password: state.password,
  })

  if (error) {
    errorMessage.value = error.message === 'Invalid login credentials'
      ? t('auth.login.invalidCredentials')
      : error.message
    loading.value = false
    return
  }

  const profile = await fetchProfile(true)

  if (!profile) {
    errorMessage.value = t('auth.login.noProfile')
    await client.auth.signOut()
    loading.value = false
    return
  }

  if (!profile.is_active) {
    errorMessage.value = t('auth.login.inactive')
    await client.auth.signOut()
    loading.value = false
    return
  }

  toast.add({
    title: t('auth.login.welcome', { name: profile.full_name || profile.email }),
    color: 'primary',
  })

  const redirect = String(route.query.redirect ?? '')
  await navigateTo(redirect.includes('/dashboard') ? redirect : localePath(ROLE_HOME[profile.role]))
}
</script>

<template>
  <AuthShell
    :title="t('auth.login.title')"
    :subtitle="t('auth.login.subtitle')"
  >
    <UAlert
      v-if="notice"
      color="warning"
      variant="soft"
      icon="i-lucide-triangle-alert"
      :description="notice"
      class="mb-6 rounded-2xl"
    />

    <UForm
      :state="state"
      class="space-y-5"
      @submit="onSubmit"
    >
      <UFormField
        :label="t('auth.login.email')"
        name="email"
        required
      >
        <UInput
          v-model="state.email"
          type="email"
          size="lg"
          autocomplete="email"
          placeholder="tucorreo@ejemplo.com"
          icon="i-lucide-mail"
          class="w-full"
          required
        />
      </UFormField>

      <UFormField
        :label="t('auth.login.password')"
        name="password"
        required
      >
        <UInput
          v-model="state.password"
          type="password"
          size="lg"
          autocomplete="current-password"
          placeholder="••••••••"
          icon="i-lucide-lock"
          class="w-full"
          required
        />
      </UFormField>

      <p
        v-if="errorMessage"
        class="text-sm font-medium text-red-600 dark:text-red-400"
      >
        {{ errorMessage }}
      </p>

      <UButton
        type="submit"
        color="primary"
        size="lg"
        block
        :loading="loading"
        :label="t('auth.login.submit')"
        class="rounded-full"
      />
    </UForm>

    <template #footer>
      <p class="text-sm text-neutral-600 dark:text-neutral-400">
        {{ t('auth.login.noAccount') }}
        <NuxtLink
          :to="localePath('/registro')"
          class="font-semibold text-brand-600 hover:underline dark:text-brand-400"
        >
          {{ t('auth.login.register') }}
        </NuxtLink>
      </p>
    </template>
  </AuthShell>
</template>
