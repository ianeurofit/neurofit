<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'light' | 'dark' }>(), { variant: 'light' })

const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const options = computed(() =>
  locales.value.map(l => ({
    code: l.code,
    label: l.code.toUpperCase(),
    name: l.name,
    to: switchLocalePath(l.code),
  })),
)
</script>

<template>
  <div
    class="inline-flex items-center rounded-full border p-0.5"
    :class="variant === 'dark' ? 'border-white/15 bg-white/5' : 'border-neutral-200 dark:border-white/10'"
    role="group"
    :aria-label="$t('nav.language')"
  >
    <NuxtLink
      v-for="option in options"
      :key="option.code"
      :to="option.to"
      :title="option.name"
      class="rounded-full px-2.5 py-1 text-xs font-bold transition-colors"
      :class="option.code === locale
        ? 'bg-brand-500 text-white'
        : 'text-neutral-500 hover:text-brand-600 dark:text-neutral-400 dark:hover:text-brand-400'"
    >
      {{ option.label }}
    </NuxtLink>
  </div>
</template>
