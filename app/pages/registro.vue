<script setup lang="ts">
definePageMeta({ layout: false })

const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: () => t('seo.register.title'),
  description: () => t('seo.register.description'),
  robots: 'noindex',
})

const client = useSupabaseClient()
const toast = useToast()
const { fetchProfile } = useProfile()

const state = reactive({ fullName: '', email: '', password: '', confirm: '' })
const loading = ref(false)
const errorMessage = ref('')
const emailSent = ref(false)

function validate() {
  const errors: { name: string, message: string }[] = []
  if (state.fullName.trim().length < 3) errors.push({ name: 'fullName', message: t('auth.register.errors.name') })
  if (!state.email.includes('@')) errors.push({ name: 'email', message: t('auth.register.errors.email') })
  if (state.password.length < 8) errors.push({ name: 'password', message: t('auth.register.errors.password') })
  if (state.password !== state.confirm) errors.push({ name: 'confirm', message: t('auth.register.errors.confirm') })
  return errors
}

async function onSubmit() {
  loading.value = true
  errorMessage.value = ''

  const { data, error } = await client.auth.signUp({
    email: state.email.trim().toLowerCase(),
    password: state.password,
    options: {
      data: { full_name: state.fullName.trim() },
      emailRedirectTo: `${window.location.origin}${localePath('/confirm')}`,
    },
  })

  loading.value = false

  if (error) {
    errorMessage.value = error.message
    return
  }

  // Sin sesión inmediata significa que el proyecto exige confirmar el correo
  if (!data.session) {
    emailSent.value = true
    return
  }

  const profile = await fetchProfile(true)
  toast.add({
    title: t('auth.register.created'),
    description: t('auth.register.createdText'),
    color: 'primary',
  })
  await navigateTo(localePath(profile ? '/dashboard' : '/login'))
}
</script>

<template>
  <AuthShell
    :title="t('auth.register.title')"
    :subtitle="t('auth.register.subtitle')"
  >
    <div
      v-if="emailSent"
      class="space-y-6 text-center"
    >
      <div class="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
        <UIcon
          name="i-lucide-mail-check"
          class="size-7"
        />
      </div>
      <div>
        <h2 class="text-lg font-bold">
          {{ t('auth.register.checkEmail') }}
        </h2>
        <i18n-t
          keypath="auth.register.checkEmailText"
          tag="p"
          class="mt-2 text-sm text-neutral-600 dark:text-neutral-400"
        >
          <template #email>
            <strong>{{ state.email }}</strong>
          </template>
        </i18n-t>
      </div>
      <UButton
        :to="localePath('/login')"
        :label="t('auth.register.backToLogin')"
        color="primary"
        variant="soft"
        class="rounded-full"
      />
    </div>

    <UForm
      v-else
      :state="state"
      :validate="validate"
      class="space-y-5"
      @submit="onSubmit"
    >
      <UFormField
        :label="t('auth.register.fullName')"
        name="fullName"
        required
      >
        <UInput
          v-model="state.fullName"
          size="lg"
          icon="i-lucide-user"
          :placeholder="t('auth.register.namePlaceholder')"
          class="w-full"
        />
      </UFormField>

      <UFormField
        :label="t('auth.register.email')"
        name="email"
        required
      >
        <UInput
          v-model="state.email"
          type="email"
          size="lg"
          icon="i-lucide-mail"
          autocomplete="email"
          placeholder="tucorreo@ejemplo.com"
          class="w-full"
        />
      </UFormField>

      <UFormField
        :label="t('auth.register.password')"
        name="password"
        required
        :help="t('auth.register.passwordHelp')"
      >
        <UInput
          v-model="state.password"
          type="password"
          size="lg"
          icon="i-lucide-lock"
          autocomplete="new-password"
          placeholder="••••••••"
          class="w-full"
        />
      </UFormField>

      <UFormField
        :label="t('auth.register.confirm')"
        name="confirm"
        required
      >
        <UInput
          v-model="state.confirm"
          type="password"
          size="lg"
          icon="i-lucide-lock"
          autocomplete="new-password"
          placeholder="••••••••"
          class="w-full"
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
        :label="t('auth.register.submit')"
        class="rounded-full"
      />

      <i18n-t
        keypath="auth.register.terms"
        tag="p"
        class="text-xs text-neutral-500 dark:text-neutral-400"
      >
        <template #link>
          <NuxtLink
            :to="localePath('/politicas')"
            class="font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            {{ t('auth.register.termsLink') }}
          </NuxtLink>
        </template>
      </i18n-t>
    </UForm>

    <template #footer>
      <p class="text-sm text-neutral-600 dark:text-neutral-400">
        {{ t('auth.register.haveAccount') }}
        <NuxtLink
          :to="localePath('/login')"
          class="font-semibold text-brand-600 hover:underline dark:text-brand-400"
        >
          {{ t('auth.register.login') }}
        </NuxtLink>
      </p>
    </template>
  </AuthShell>
</template>
