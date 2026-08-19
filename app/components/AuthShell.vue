<script setup lang="ts">
defineProps<{ title: string, subtitle?: string }>()

const { t } = useI18n()
const localePath = useLocalePath()

const colorMode = useColorMode()
const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: (val) => {
    colorMode.preference = val ? 'dark' : 'light'
  },
})
</script>

<template>
  <div class="grid min-h-screen bg-white lg:grid-cols-2 dark:bg-ink-950">
    <!-- Panel de marca -->
    <aside class="relative hidden overflow-hidden bg-ink-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div class="bg-radial-dots pointer-events-none absolute inset-0 text-brand-500/25" />
      <div
        class="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-brand-500/20 blur-3xl"
      />
      <div
        class="pointer-events-none absolute -bottom-32 -left-16 size-96 rounded-full bg-brand-700/20 blur-3xl"
      />

      <NuxtLink
        to="/"
        class="relative"
      >
        <NuxtImg
          src="/logo-teal-gray.svg"
          alt="Neurofit IA"
          class="h-10 w-auto"
        />
      </NuxtLink>

      <div class="relative max-w-md">
        <p class="section-eyebrow text-brand-400">
          {{ t('auth.brandEyebrow') }}
        </p>
        <h2 class="mt-4 text-3xl font-extrabold leading-tight text-white">
          {{ t('auth.brandTitle') }}
        </h2>
        <p class="mt-4 text-sm leading-relaxed text-neutral-300">
          {{ t('auth.brandText') }}
        </p>
      </div>

      <p class="relative text-xs text-neutral-500">
        © {{ new Date().getFullYear() }} Neurofit IA
      </p>
    </aside>

    <!-- Formulario -->
    <main class="flex flex-col">
      <div class="flex items-center justify-between p-6">
        <NuxtLink
          to="/"
          class="lg:invisible"
        >
          <NuxtImg
            src="/logo-teal-gray.svg"
            alt="Neurofit IA"
            class="h-8 w-auto"
          />
        </NuxtLink>
        <LangSwitcher class="mr-1" />

        <ClientOnly>
          <USwitch
            v-model="isDark"
            unchecked-icon="i-lucide-sun"
            checked-icon="i-lucide-moon"
            :aria-label="t('nav.toggleTheme')"
          />
          <template #fallback>
            <div class="size-5" />
          </template>
        </ClientOnly>
      </div>

      <div class="flex flex-1 items-center justify-center px-6 pb-12">
        <div class="w-full max-w-md">
          <NuxtLink
            :to="localePath('/')"
            class="mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
          >
            <UIcon
              name="i-lucide-arrow-left"
              class="size-4"
            />
            {{ t('auth.backHome') }}
          </NuxtLink>

          <h1 class="text-3xl font-extrabold tracking-tight">
            {{ title }}
          </h1>
          <p
            v-if="subtitle"
            class="mt-2 text-sm text-neutral-600 dark:text-neutral-400"
          >
            {{ subtitle }}
          </p>

          <div class="mt-8">
            <slot />
          </div>

          <div class="mt-8">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
