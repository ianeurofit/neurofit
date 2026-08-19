<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Retraso de entrada en milisegundos */
    delay?: number
    interactive?: boolean
  }>(),
  {
    delay: 0,
    interactive: true,
  },
)
</script>

<template>
  <div
    class="demo-enter rounded-2xl border border-neutral-200 bg-white p-5 transition-transform duration-300 dark:border-white/10 dark:bg-ink-900"
    :class="interactive ? 'hover:-translate-y-1' : ''"
    :style="{ '--delay': `${delay}ms` }"
  >
    <slot />
  </div>
</template>
