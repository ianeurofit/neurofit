<script setup lang="ts">
import { UCard } from '#components'

withDefaults(
  defineProps<{
    icon: string
    title: string
    description?: string
    color?: 'brand' | 'blue' | 'violet' | 'orange' | 'neutral'
    variant?: 'card' | 'plain'
  }>(),
  {
    color: 'brand',
    variant: 'card'
  }
)

const colorClasses: Record<string, string> = {
  brand: 'text-brand-600 bg-brand-50 dark:text-brand-400 dark:bg-brand-950/40',
  blue: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40',
  violet: 'text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-950/40',
  orange: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/40',
  neutral: 'text-neutral-600 bg-neutral-100 dark:text-neutral-300 dark:bg-neutral-800'
}
</script>

<template>
  <component
    :is="variant === 'card' ? UCard : 'div'"
    :class="variant === 'card' ? 'h-full transition-shadow hover:shadow-md' : 'h-full'"
    :ui="variant === 'card' ? { body: 'p-6' } : undefined"
  >
    <div class="flex items-center justify-center rounded-full" :class="[colorClasses[color], 'size-11']">
      <UIcon :name="icon" class="size-5" />
    </div>
    <h3 class="mt-4 font-bold text-neutral-900 dark:text-white">{{ title }}</h3>
    <p v-if="description" class="mt-1.5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
      {{ description }}
    </p>
    <slot />
  </component>
</template>
