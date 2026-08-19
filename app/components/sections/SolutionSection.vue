<script setup lang="ts">
const { t } = useI18n()

const capabilities = [
  { icon: 'i-lucide-search-check', key: 'evaluate' },
  { icon: 'i-lucide-shield-check', key: 'monitor' },
  { icon: 'i-lucide-bell-ring', key: 'risks' },
  { icon: 'i-lucide-triangle-alert', key: 'alerts' },
  { icon: 'i-lucide-lightbulb', key: 'recommendations' },
  { icon: 'i-lucide-target', key: 'optimize' },
]

const stats = [
  { icon: 'i-lucide-users', value: 10, prefix: '+', key: 'dimensions' },
  { icon: 'i-lucide-brain', value: 50, prefix: '+', key: 'variables' },
  { icon: 'i-lucide-database', value: 1, prefix: '+', suffix: 'M', key: 'data' },
  { icon: 'i-lucide-trending-up', value: 100, suffix: '%', key: 'focus' },
]
</script>

<template>
  <section
    id="tecnologia"
    class="py-20 lg:py-28"
  >
    <UContainer>
      <div class="grid gap-14 lg:grid-cols-2 lg:items-center">
        <div>
          <UiSectionEyebrow :label="t('solution.eyebrow')" />
          <h2 class="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
            {{ t('solution.title') }}<br>
            <span class="text-brand-600 dark:text-brand-400">{{ t('solution.titleHighlight') }}</span>
          </h2>
          <p class="mt-4 text-neutral-600 dark:text-neutral-400">
            {{ t('solution.intro') }}
          </p>

          <div class="mt-5 h-px w-16 bg-neutral-300 dark:bg-neutral-700" />

          <UAlert
            color="primary"
            variant="soft"
            class="mt-5 rounded-xl"
          >
            <template #description>
              <span class="flex items-start gap-3 text-neutral-700 dark:text-neutral-300">
                <UIcon
                  name="i-lucide-brain-circuit"
                  class="mt-0.5 size-5 shrink-0 text-brand-600 dark:text-brand-400"
                />
                <i18n-t
                  keypath="solution.alert"
                  tag="span"
                >
                  <template #decisions>
                    <span class="font-semibold text-brand-700 dark:text-brand-400">{{ t('solution.alertDecisions') }}</span>
                  </template>
                </i18n-t>
              </span>
            </template>
          </UAlert>

          <p class="mt-8 text-sm font-bold tracking-wide text-neutral-900 dark:text-white">
            {{ t('solution.capabilitiesTitle') }}
          </p>
          <div class="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <div
              v-for="item in capabilities"
              :key="item.key"
              class="flex items-start gap-3"
            >
              <div class="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
                <UIcon
                  :name="item.icon"
                  class="size-4"
                />
              </div>
              <div>
                <p class="font-semibold text-neutral-900 dark:text-white">
                  {{ t(`solution.capabilities.${item.key}.title`) }}
                </p>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">
                  {{ t(`solution.capabilities.${item.key}.description`) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-8">
          <NuxtImg src="/brain-score-pc.webp" />
          <!--
            <UCard :ui="{ body: 'p-6' }" class="shadow-xl shadow-brand-950/5">
              <div class="flex items-center justify-between">
                <p class="font-bold text-neutral-900 dark:text-white">Tu Brain Score™</p>
                <UBadge color="primary" variant="subtle" class="rounded-full">Bueno</UBadge>
              </div>
              <div class="mt-5 flex items-center gap-6">
                <UiStatRing :value="82" />
                <div class="flex-1 space-y-4">
                  <UiDimensionBar
                  v-for="dim in dimensions"
                  :key="dim.label"
                  :label="dim.label"
                  :value="dim.value"
                  :color="dim.color"
                  />
                </div>
              </div>
            </UCard>
            -->

          <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <UiStatCounter
              v-for="stat in stats"
              :key="stat.key"
              :icon="stat.icon"
              :value="stat.value"
              :prefix="stat.prefix"
              :suffix="stat.suffix"
              :label="t(`solution.stats.${stat.key}`)"
            />
          </div>
        </div>
      </div>
    </UContainer>
  </section>
</template>
