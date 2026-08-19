<script setup lang="ts">
const { t, tm, rt } = useI18n()

const dimensions = [
  { icon: 'i-lucide-brain', value: 85, key: 'cognition', color: 'brand' as const },
  { icon: 'i-lucide-heart-pulse', value: 78, key: 'emotional', color: 'blue' as const },
  { icon: 'i-lucide-person-standing', value: 80, key: 'lifestyle', color: 'violet' as const },
  { icon: 'i-lucide-shield-alert', value: 70, key: 'risk', color: 'orange' as const },
]

const projection = [
  { key: 'today', score: 82 },
  { key: 'y5', score: 78 },
  { key: 'y10', score: 72 },
  { key: 'y20', score: 65 },
]

const deliverables = [
  { icon: 'i-lucide-clipboard-list', key: 'score' },
  { icon: 'i-lucide-scan-search', key: 'risk' },
  { icon: 'i-lucide-bell', key: 'alerts' },
  { icon: 'i-lucide-lightbulb', key: 'recommendations' },
  { icon: 'i-lucide-calendar-check', key: 'plan' },
  { icon: 'i-lucide-line-chart', key: 'tracking' },
]

const maxScore = 100
</script>

<template>
  <section
    id="brain-score"
    class="bg-neutral-50 py-20 dark:bg-neutral-900/40 lg:py-28"
  >
    <UContainer>
      <div class="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <UiSectionEyebrow :label="t('brainScore.eyebrow')" />
          <i18n-t
            keypath="brainScore.title"
            tag="h2"
            class="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl dark:text-white"
          >
            <template #highlight>
              <span class="text-brand-600 dark:text-brand-400">{{ t('brainScore.titleHighlight') }}</span>
            </template>
          </i18n-t>
          <i18n-t
            keypath="brainScore.intro"
            tag="p"
            class="mt-4 text-neutral-600 dark:text-neutral-400"
          >
            <template #current>
              <span class="font-semibold text-neutral-900 dark:text-white">{{ t('brainScore.introCurrent') }}</span>
            </template>
            <template #future>
              <span class="font-semibold text-neutral-900 dark:text-white">{{ t('brainScore.introFuture') }}</span>
            </template>
          </i18n-t>
          <NuxtPicture
            format="avif,webp"
            src="/hand-brain.webp"
            fit="fill"
          />
          <div class="mt-6 h-px w-16 bg-neutral-300 dark:bg-neutral-700" />

          <p class="mt-8 font-serif text-lg italic text-neutral-500 dark:text-neutral-400">
            {{ t('brainScore.quote') }}
          </p>
        </div>

        <UCard
          :ui="{ body: 'p-6 sm:p-8' }"
          class="shadow-xl shadow-brand-950/5"
        >
          <div class="grid gap-8 sm:grid-cols-2">
            <div class="flex flex-col items-center justify-center gap-3 rounded-2xl bg-neutral-50 p-6 text-center dark:bg-neutral-900/60">
              <p class="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                {{ t('brainScore.cardScore') }}
              </p>
              <UiStatRing
                :value="82"
                :size="150"
              />
              <UBadge
                color="primary"
                variant="subtle"
                class="rounded-full"
              >
                {{ t('brainScore.cardBadge') }}
              </UBadge>
            </div>

            <div>
              <p class="mb-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                {{ t('brainScore.cardDimensions') }}
              </p>
              <div class="space-y-4">
                <UiDimensionBar
                  v-for="dim in dimensions"
                  :key="dim.key"
                  :label="t(`brainScore.dimensions.${dim.key}`)"
                  :value="dim.value"
                  :color="dim.color"
                />
              </div>
            </div>
          </div>

          <div class="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <p class="mb-3 text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                {{ t('brainScore.cardProjection') }}
              </p>
              <div class="flex items-end justify-between gap-2">
                <div
                  v-for="point in projection"
                  :key="point.key"
                  class="flex flex-col items-center gap-2"
                >
                  <div class="flex h-24 w-8 items-end rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div
                      class="w-full rounded-full bg-gradient-to-t from-brand-600 to-brand-400 transition-all"
                      :style="{ height: `${(point.score / maxScore) * 100}%` }"
                    />
                  </div>
                  <span class="text-xs font-bold text-neutral-700 dark:text-neutral-300">{{ point.score }}</span>
                  <span class="text-[11px] text-neutral-500 dark:text-neutral-400">
                    {{ t(`brainScore.projection.${point.key}`) }}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <p class="mb-3 text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                {{ t('brainScore.cardRecommendations') }}
              </p>
              <ul class="space-y-1.5">
                <li
                  v-for="(rec, index) in tm('brainScore.recommendations')"
                  :key="index"
                  class="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300"
                >
                  <UIcon
                    name="i-lucide-check-circle-2"
                    class="size-4 shrink-0 text-brand-500"
                  />
                  {{ rt(rec) }}
                </li>
              </ul>
              <UButton
                :label="t('brainScore.cardCta')"
                color="primary"
                size="sm"
                class="mt-4 rounded-full"
                href="/demo"
              />
            </div>
          </div>
        </UCard>
      </div>

      <div class="mt-14">
        <p class="mb-6 text-center text-sm font-bold tracking-wide text-neutral-500 dark:text-neutral-400">
          {{ t('brainScore.deliverablesTitle') }}
        </p>
        <div
          v-auto-animate
          class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6"
        >
          <div
            v-for="item in deliverables"
            :key="item.key"
            class="flex flex-col items-center text-center"
          >
            <div class="flex size-14 items-center justify-center rounded-full bg-white text-brand-600 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:text-brand-400 dark:ring-neutral-800">
              <UIcon
                :name="item.icon"
                class="size-6"
              />
            </div>
            <p class="mt-3 text-sm font-bold text-neutral-900 dark:text-white">
              {{ t(`brainScore.deliverables.${item.key}.title`) }}
            </p>
            <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              {{ t(`brainScore.deliverables.${item.key}.description`) }}
            </p>
          </div>
        </div>
      </div>
    </UContainer>
  </section>
</template>
