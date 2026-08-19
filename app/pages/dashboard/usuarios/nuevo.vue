<script setup lang="ts">
import { ROLE_ICONS, USER_ROLES, type UserRole } from '~/types/user'

definePageMeta({ layout: 'dashboard', titleKey: 'dashboard.titles.newUser' })

const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({ title: () => t('seo.newUser.title'), robots: 'noindex' })

const toast = useToast()

const roleOptions = computed(() =>
  USER_ROLES.map(role => ({
    value: role,
    label: t(`roles.${role}.label`),
    description: t(`roles.${role}.description`),
    icon: ROLE_ICONS[role],
  })),
)

const state = reactive({
  full_name: '',
  email: '',
  password: '',
  role: 'user' as UserRole,
  is_active: true,
})

const loading = ref(false)
const errorMessage = ref('')

function validate() {
  const errors: { name: string, message: string }[] = []
  if (state.full_name.trim().length < 3) errors.push({ name: 'full_name', message: t('dashboard.newUser.errors.name') })
  if (!state.email.includes('@')) errors.push({ name: 'email', message: t('dashboard.newUser.errors.email') })
  if (state.password.length < 8) errors.push({ name: 'password', message: t('dashboard.newUser.errors.password') })
  return errors
}

function generatePassword() {
  const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%'
  const values = new Uint32Array(14)
  crypto.getRandomValues(values)
  state.password = Array.from(values, v => chars[v % chars.length]).join('')
}

async function onSubmit() {
  loading.value = true
  errorMessage.value = ''

  try {
    await $fetch('/api/admin/users', {
      method: 'POST',
      body: {
        email: state.email,
        password: state.password,
        full_name: state.full_name,
        role: state.role,
        is_active: state.is_active,
      },
    })

    toast.add({
      title: t('dashboard.newUser.created'),
      description: t('dashboard.newUser.createdText', {
        email: state.email,
        role: t(`roles.${state.role}.label`),
      }),
      color: 'primary',
    })

    await navigateTo(localePath('/dashboard/usuarios'))
  }
  catch (error: unknown) {
    const e = error as { statusMessage?: string, data?: { statusMessage?: string }, message?: string }
    errorMessage.value = e?.data?.statusMessage ?? e?.statusMessage ?? e?.message ?? t('dashboard.newUser.createError')
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <UButton
        :to="localePath('/dashboard/usuarios')"
        :label="t('dashboard.newUser.back')"
        icon="i-lucide-arrow-left"
        variant="link"
        color="neutral"
        class="-ml-3"
      />
      <h2 class="mt-1 text-2xl font-extrabold tracking-tight">
        {{ t('dashboard.newUser.title') }}
      </h2>
      <p class="mt-1 text-sm text-neutral-500">
        {{ t('dashboard.newUser.intro') }}
      </p>
    </div>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <UForm
        :state="state"
        :validate="validate"
        class="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-white/10 dark:bg-ink-900"
        @submit="onSubmit"
      >
        <UFormField
          :label="t('dashboard.newUser.fullName')"
          name="full_name"
          required
        >
          <UInput
            v-model="state.full_name"
            size="lg"
            icon="i-lucide-user"
            :placeholder="t('dashboard.newUser.namePlaceholder')"
            class="w-full"
          />
        </UFormField>

        <UFormField
          :label="t('dashboard.newUser.email')"
          name="email"
          required
        >
          <UInput
            v-model="state.email"
            type="email"
            size="lg"
            icon="i-lucide-mail"
            :placeholder="t('dashboard.newUser.emailPlaceholder')"
            class="w-full"
          />
        </UFormField>

        <UFormField
          :label="t('dashboard.newUser.password')"
          name="password"
          required
          :help="t('dashboard.newUser.passwordHelp')"
        >
          <div class="flex gap-2">
            <UInput
              v-model="state.password"
              size="lg"
              icon="i-lucide-lock"
              placeholder="••••••••"
              class="flex-1"
            />
            <UButton
              icon="i-lucide-dices"
              color="neutral"
              variant="outline"
              size="lg"
              class="rounded-full"
              :aria-label="t('dashboard.newUser.generateAria')"
              @click="generatePassword"
            />
          </div>
        </UFormField>

        <UFormField
          :label="t('dashboard.newUser.role')"
          name="role"
          required
          :help="t(`roles.${state.role}.description`)"
        >
          <USelectMenu
            v-model="state.role"
            :items="roleOptions"
            value-key="value"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <div class="flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3 dark:bg-white/5">
          <div>
            <p class="text-sm font-semibold">
              {{ t('dashboard.newUser.activeAccount') }}
            </p>
            <p class="text-xs text-neutral-500">
              {{ t('dashboard.newUser.activeAccountHelp') }}
            </p>
          </div>
          <USwitch v-model="state.is_active" />
        </div>

        <p
          v-if="errorMessage"
          class="text-sm font-medium text-red-600 dark:text-red-400"
        >
          {{ errorMessage }}
        </p>

        <div class="flex flex-wrap gap-3 pt-2">
          <UButton
            type="submit"
            :label="t('dashboard.newUser.submit')"
            color="primary"
            size="lg"
            class="rounded-full"
            :loading="loading"
          />
          <UButton
            :to="localePath('/dashboard/usuarios')"
            :label="t('dashboard.newUser.cancel')"
            color="neutral"
            variant="ghost"
            size="lg"
            class="rounded-full"
          />
        </div>
      </UForm>

      <aside class="space-y-4">
        <div class="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-white/10 dark:bg-ink-900">
          <p class="section-eyebrow">
            {{ t('dashboard.newUser.rolesTitle') }}
          </p>
          <ul class="mt-4 space-y-4">
            <li
              v-for="option in roleOptions"
              :key="option.value"
              class="flex gap-3"
            >
              <div class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                <UIcon
                  :name="option.icon"
                  class="size-4"
                />
              </div>
              <div>
                <p class="text-sm font-semibold">
                  {{ option.label }}
                </p>
                <p class="text-xs text-neutral-500">
                  {{ option.description }}
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div class="rounded-2xl border border-brand-200 bg-brand-50 p-5 dark:border-brand-900 dark:bg-brand-900/20">
          <p class="text-sm font-semibold text-brand-800 dark:text-brand-200">
            {{ t('dashboard.newUser.shareTitle') }}
          </p>
          <p class="mt-1 text-xs text-brand-700/80 dark:text-brand-300/80">
            {{ t('dashboard.newUser.shareText') }}
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>
