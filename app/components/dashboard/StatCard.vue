<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  icon: string
  hint?: string
}>()
</script>

<template>
  <div class="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-white/10 dark:bg-ink-900">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.12em] text-neutral-500">
          {{ label }}
        </p>
        <p class="mt-2 text-3xl font-extrabold tracking-tight">
          {{ value }}
        </p>
        <p
          v-if="hint"
          class="mt-1 text-xs text-neutral-500"
        >
          {{ hint }}
        </p>
      </div>
      <div class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
        <UIcon
          :name="icon"
          class="size-5"
        />
      </div>
    </div>
  </div>
</template>
