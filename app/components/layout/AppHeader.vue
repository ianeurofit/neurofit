<script setup lang="ts">
const colorMode = useColorMode()

const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: (val) => {
    colorMode.preference = val ? 'dark' : 'light'
  },
})

const links = [
  { label: 'Inicio', to: '#inicio' },
  { label: 'Plataforma', to: '#tecnologia' },
  { label: 'Sobre Neurofit IA', to: '#vision' },
  { label: 'Contacto', to: '#contacto' },
]

const mobileOpen = ref(false)
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b border-neutral-200/70 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-ink-950/80"
  >
    <UContainer class="flex h-20 items-center justify-between">
      <NuxtLink to="#inicio" class="flex items-center gap-2.5">
        <UIcon name="i-lucide-brain-circuit" class="size-8 text-brand-600 dark:text-brand-400" />
        <span class="leading-tight">
          <span class="block text-lg font-extrabold tracking-tight text-neutral-900 dark:text-white">
            NEUROFIT <span class="text-brand-600 dark:text-brand-400">AI</span>
          </span>
          <span class="block text-[10px] font-semibold tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
            BRAIN INTELLIGENCE
          </span>
        </span>
      </NuxtLink>

      <nav class="hidden items-center gap-8 lg:flex">
        <a
          v-for="link in links"
          :key="link.to"
          :href="link.to"
          class="relative text-sm font-semibold text-neutral-700 transition-colors hover:text-brand-600 dark:text-neutral-300 dark:hover:text-brand-400"
        >
          {{ link.label }}
        </a>
      </nav>

      <div class="flex items-center gap-2 sm:gap-4">
        <ClientOnly>
          <USwitch
            v-model="isDark"
            unchecked-icon="i-lucide-sun"
            checked-icon="i-lucide-moon"
            aria-label="Cambiar tema claro u oscuro"
          />
          <template #fallback>
            <div class="size-5" />
          </template>
        </ClientOnly>

        <UButton
          label="Solicitar acceso"
          color="primary"
          size="md"
          class="hidden rounded-full px-5 sm:inline-flex"
        />

        <UButton
          icon="i-lucide-menu"
          color="neutral"
          variant="ghost"
          class="lg:hidden"
          aria-label="Abrir menú"
          @click="mobileOpen = !mobileOpen"
        />
      </div>
    </UContainer>

    <div v-if="mobileOpen" v-auto-animate class="border-t border-neutral-200 px-4 py-4 lg:hidden dark:border-white/10">
      <a
        v-for="link in links"
        :key="link.to"
        :href="link.to"
        class="block py-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300"
        @click="mobileOpen = false"
      >
        {{ link.label }}
      </a>
      <UButton label="Solicitar acceso" color="primary" block class="mt-2 rounded-full" />
    </div>
  </header>
</template>
