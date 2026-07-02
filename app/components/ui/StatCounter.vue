<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    value: number
    prefix?: string
    suffix?: string
    label: string
    icon?: string
    color?: 'brand' | 'blue' | 'violet' | 'orange'
  }>(),
  {
    prefix: '',
    suffix: '',
    color: 'brand'
  }
)

const { current, el } = useCountUp(props.value)

const colorClasses: Record<string, string> = {
  brand: 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40',
  blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40',
  violet: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40',
  orange: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40'
}
</script>

<template>
  <div
    ref="el"
    class="flex items-center gap-3 rounded-2xl p-4 transition-transform duration-300 hover:-translate-y-0.5"
    :class="colorClasses[color]"
  >
    <UIcon v-if="icon" :name="icon" class="size-7 shrink-0" />
    <div v-auto-animate class="leading-tight">
      <p class="text-2xl font-extrabold tabular-nums sm:text-3xl">
        {{ prefix }}{{ current }}{{ suffix }}
      </p>
      <p class="text-xs font-medium text-neutral-600 dark:text-neutral-400 sm:text-sm">
        {{ label }}
      </p>
    </div>
  </div>
</template>
