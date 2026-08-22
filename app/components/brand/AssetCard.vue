<script setup lang="ts">
defineProps<{
  src: string
  filename: string
  label: string
  /** Fondo de la tarjeta de previsualización. */
  tone: 'dark' | 'light' | 'checker'
  size?: string
}>()
</script>

<template>
  <div
    data-reveal
    class="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors duration-300 hover:border-brand-500/40"
  >
    <div
      class="flex items-center justify-center p-8"
      :class="{
        'bg-[#0a0a0a]': tone === 'dark',
        'bg-[#f2f2f2]': tone === 'light',
        'brand-checker': tone === 'checker',
      }"
    >
      <img
        :src="src"
        :alt="label"
        loading="lazy"
        class="w-full object-contain transition-transform duration-500 group-hover:scale-105"
        :style="{ maxHeight: size ?? '4.5rem' }"
      >
    </div>

    <div class="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
      <span class="truncate text-xs font-semibold uppercase tracking-wide text-neutral-300">{{ label }}</span>
      <a
        :href="src"
        :download="filename"
        class="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-neutral-300 transition-colors hover:bg-brand-500 hover:text-white"
        :aria-label="`Descargar ${label}`"
      >
        <UIcon
          name="i-lucide-download"
          class="size-4"
        />
      </a>
    </div>
  </div>
</template>

<style scoped>
.brand-checker {
  background-image:
    linear-gradient(45deg, #1a1a1a 25%, transparent 25%),
    linear-gradient(-45deg, #1a1a1a 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #1a1a1a 75%),
    linear-gradient(-45deg, transparent 75%, #1a1a1a 75%);
  background-size: 16px 16px;
  background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
  background-color: #0f0f0f;
}
</style>
