<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { ui } = useDemo()

const colorMode = useColorMode()
const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: (val) => {
    colorMode.preference = val ? 'dark' : 'light'
  },
})
</script>

<template>
  <div class="flex min-h-screen flex-col bg-neutral-50 dark:bg-ink-950">
    <header
      class="sticky top-0 z-40 border-b border-neutral-200 bg-white/85 backdrop-blur-md dark:border-white/10 dark:bg-ink-950/85"
    >
      <div class="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-3 px-4 sm:h-18 sm:px-6">
        <div class="flex min-w-0 items-center gap-3">
          <NuxtLink
            :to="localePath('/')"
            class="shrink-0"
          >
            <NuxtImg
              src="/logo-teal-gray.svg"
              alt="Neurofit IA"
              class="h-7 w-auto sm:h-8"
            />
          </NuxtLink>
          <span
            class="hidden h-6 w-px bg-neutral-200 sm:block dark:bg-white/15"
            aria-hidden="true"
          />
          <p class="hidden truncate text-sm font-medium text-neutral-500 sm:block dark:text-neutral-400">
            {{ ui.panelName }}
          </p>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <LangSwitcher />

          <ClientOnly>
            <UButton
              :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
              color="neutral"
              variant="ghost"
              size="sm"
              class="rounded-full"
              :aria-label="t('nav.toggleTheme')"
              @click="isDark = !isDark"
            />
            <template #fallback>
              <div class="size-8" />
            </template>
          </ClientOnly>

          <span
            class="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700 ring-1 ring-brand-200 dark:bg-brand-900/40 dark:text-brand-300 dark:ring-brand-800"
            aria-hidden="true"
          >DR</span>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>
