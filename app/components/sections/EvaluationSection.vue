<script setup lang="ts">
const { t, tm, rt } = useI18n()

const columns = [
  { number: 1, key: 'cognition', icon: 'i-lucide-brain', color: 'brand' as const },
  { number: 2, key: 'emotional', icon: 'i-lucide-heart-pulse', color: 'blue' as const },
  { number: 3, key: 'lifestyle', icon: 'i-lucide-person-standing', color: 'violet' as const },
  { number: 4, key: 'risk', icon: 'i-lucide-shield-alert', color: 'orange' as const },
]

const colorMap: Record<string, { text: string, dot: string, ring: string }> = {
  brand: { text: 'text-brand-600 dark:text-brand-400', dot: 'bg-brand-500', ring: 'bg-brand-50 dark:bg-brand-950/40' },
  blue: { text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500', ring: 'bg-blue-50 dark:bg-blue-950/40' },
  violet: { text: 'text-violet-600 dark:text-violet-400', dot: 'bg-violet-500', ring: 'bg-violet-50 dark:bg-violet-950/40' },
  orange: { text: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-500', ring: 'bg-orange-50 dark:bg-orange-950/40' },
}
</script>

<template>
  <section
    id="solucion"
    class="py-20 lg:py-28"
  >
    <UContainer>
      <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <UiSectionEyebrow :label="t('evaluation.eyebrow')" />
          <i18n-t
            keypath="evaluation.title"
            tag="h2"
            class="mt-3 max-w-lg text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl dark:text-white"
          >
            <template #highlight>
              <span class="text-brand-600 dark:text-brand-400">{{ t('evaluation.titleHighlight') }}</span>
            </template>
          </i18n-t>
        </div>
        <p class="max-w-md text-neutral-600 dark:text-neutral-400">
          {{ t('evaluation.intro') }}
        </p>
      </div>

      <div class="relative mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="col in columns"
          :key="col.key"
          class="rounded-2xl p-6 ring-1 ring-neutral-200 dark:ring-neutral-800"
          :class="colorMap[col.color].ring"
        >
          <div class="flex size-12 items-center justify-center rounded-full bg-white dark:bg-neutral-900">
            <UIcon
              :name="col.icon"
              class="size-6"
              :class="colorMap[col.color].text"
            />
          </div>
          <h3
            class="mt-4 text-lg font-bold"
            :class="colorMap[col.color].text"
          >
            {{ col.number }}. {{ t(`evaluation.columns.${col.key}.title`) }}
          </h3>
          <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            {{ t(`evaluation.columns.${col.key}.description`) }}
          </p>
          <div class="mt-4 h-px bg-neutral-200 dark:bg-neutral-700" />
          <ul class="mt-4 space-y-2.5">
            <li
              v-for="(item, index) in tm(`evaluation.columns.${col.key}.items`)"
              :key="index"
              class="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300"
            >
              <span
                class="size-1.5 shrink-0 rounded-full"
                :class="colorMap[col.color].dot"
              />
              {{ rt(item) }}
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-8 grid gap-4 rounded-2xl bg-neutral-50 p-6 sm:grid-cols-2 dark:bg-neutral-900/40">
        <p class="flex items-start gap-3 text-sm text-neutral-700 dark:text-neutral-300">
          <UIcon
            name="i-lucide-brain-circuit"
            class="mt-0.5 size-5 shrink-0 text-brand-600 dark:text-brand-400"
          />
          <i18n-t
            keypath="evaluation.footerNote"
            tag="span"
          >
            <template #diagnosis>
              <span class="font-semibold text-brand-700 dark:text-brand-400">{{ t('evaluation.footerDiagnosis') }}</span>
            </template>
          </i18n-t>
        </p>
        <p class="flex items-start gap-3 text-sm font-semibold text-neutral-900 sm:justify-self-end dark:text-white">
          <UIcon
            name="i-lucide-sparkles"
            class="mt-0.5 size-5 shrink-0 text-brand-600 dark:text-brand-400"
          />
          {{ t('evaluation.footerClaim') }}
        </p>
      </div>
    </UContainer>
  </section>
</template>
