<script setup lang="ts">
const colorMode = useColorMode()

const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: (val) => {
    colorMode.preference = val ? 'dark' : 'light'
  },
})

const { t } = useI18n()
const localePath = useLocalePath()

// `route: true` marca los enlaces que navegan a otra pagina en vez de a un
// ancla de la portada.
const links = computed(() => [
  { key: 'nav.home', to: '#inicio', route: false },
  { key: 'nav.platform', to: '#tecnologia', route: false },
  { key: 'nav.education', to: localePath('/educacion'), route: true },
  { key: 'nav.about', to: '#vision', route: false },
  { key: 'nav.contact', to: '#contacto', route: false },
])

const mobileOpen = ref(false)
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b border-neutral-200/70 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-ink-950/80"
  >
    <UContainer class="flex h-20 items-center justify-between">
      <NuxtLink
        to="/"
        class="flex items-center gap-2.5"
      >

        <NuxtPicture
          format="avif,webp"
          src="/logo-teal-gray.svg"
          :img-attrs="{ class: ' sm:w-[30vw] md:w-[30vw] lg:w-[15vw] h-auto' }"
        />

      </NuxtLink>

      <nav class="hidden items-center gap-8 lg:flex">
        <template
          v-for="link in links"
          :key="link.to"
        >
          <NuxtLink
            v-if="link.route"
            :to="link.to"
            class="relative text-sm font-semibold text-neutral-700 transition-colors hover:text-brand-600 dark:text-neutral-300 dark:hover:text-brand-400"
          >
            {{ t(link.key) }}
          </NuxtLink>
          <a
            v-else
            :href="link.to"
            class="relative text-sm font-semibold text-neutral-700 transition-colors hover:text-brand-600 dark:text-neutral-300 dark:hover:text-brand-400"
          >
            {{ t(link.key) }}
          </a>
        </template>
      </nav>

      <div class="flex items-center gap-2 sm:gap-4">
        <LangSwitcher />

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

        <UButton
          :to="localePath('/demo/carlos-gomez')"
          :label="t('nav.demo')"
          color="neutral"
          variant="ghost"
          size="md"
          class="hidden rounded-full px-4 sm:inline-flex"
          icon="i-lucide-monitor-play"
        />

        <UButton
          :to="localePath('/login')"
          :label="t('nav.login')"
          color="neutral"
          variant="ghost"
          size="md"
          class="hidden rounded-full px-4 sm:inline-flex"
          icon="i-lucide-log-in"
        />

        <UButton
          icon="i-lucide-menu"
          color="neutral"
          variant="ghost"
          class="lg:hidden"
          :aria-label="t('nav.openMenu')"
          @click="mobileOpen = !mobileOpen"
        />
      </div>
    </UContainer>

    <div
      v-if="mobileOpen"
      v-auto-animate
      class="border-t border-neutral-200 px-4 py-4 lg:hidden dark:border-white/10"
    >
      <template
        v-for="link in links"
        :key="link.to"
      >
        <NuxtLink
          v-if="link.route"
          :to="link.to"
          class="block py-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300"
          @click="mobileOpen = false"
        >
          {{ t(link.key) }}
        </NuxtLink>
        <a
          v-else
          :href="link.to"
          class="block py-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300"
          @click="mobileOpen = false"
        >
          {{ t(link.key) }}
        </a>
      </template>
      <UButton
        :to="localePath('/demo/carlos-gomez')"
        :label="t('nav.demo')"
        color="neutral"
        variant="soft"
        block
        class="mt-2 rounded-full"
      />
      <UButton
        :to="localePath('/login')"
        :label="t('nav.login')"
        color="neutral"
        variant="soft"
        block
        class="mt-2 rounded-full"
      />
    </div>
  </header>
</template>
