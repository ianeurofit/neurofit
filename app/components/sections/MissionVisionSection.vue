<script setup lang="ts">
const { t, tm, rt } = useI18n()

const impact = [
  { icon: 'i-lucide-users', key: 'people' },
  { icon: 'i-lucide-globe', key: 'countries' },
  { icon: 'i-lucide-heart-handshake', key: 'stages' },
  { icon: 'i-lucide-trending-up', key: 'generational' },
]
</script>

<template>
  <section
    id="vision"
    class="bg-neutral-50 py-20 dark:bg-neutral-900/40 lg:py-28"
  >
    <UContainer>
      <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <UiSectionEyebrow :label="t('mission.eyebrow')" />
          <i18n-t
            keypath="mission.title"
            tag="h2"
            class="mt-3 max-w-lg text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl dark:text-white"
          >
            <template #highlight>
              <span class="text-brand-600 dark:text-brand-400">{{ t('mission.titleHighlight') }}</span>
            </template>
          </i18n-t>
        </div>
        <p class="max-w-md text-neutral-600 dark:text-neutral-400">
          {{ t('mission.intro') }}
        </p>
      </div>

      <div class="mt-12 grid gap-6 lg:grid-cols-[1fr_1fr_1.1fr]">
        <UCard :ui="{ body: 'p-7' }">
          <div class="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
            <UIcon
              name="i-lucide-rocket"
              class="size-6"
            />
          </div>
          <h3 class="mt-4 font-bold text-neutral-900 dark:text-white">
            {{ t('mission.missionTitle') }}
          </h3>
          <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            {{ t('mission.missionText') }}
          </p>
          <ul class="mt-4 space-y-2.5">
            <li
              v-for="(item, index) in tm('mission.missionItems')"
              :key="index"
              class="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300"
            >
              <UIcon
                name="i-lucide-check"
                class="mt-0.5 size-4 shrink-0 text-brand-500"
              />
              {{ rt(item) }}
            </li>
          </ul>
        </UCard>

        <UCard :ui="{ body: 'p-7 ' }">
          <div class="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
            <UIcon
              name="i-lucide-flag"
              class="size-6"
            />
          </div>
          <h3 class="mt-4 font-bold text-neutral-900 dark:text-white">
            {{ t('mission.visionTitle') }}
          </h3>
          <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            {{ t('mission.visionText') }}
          </p>
          <ul class="mt-4 space-y-2.5">
            <li
              v-for="(item, index) in tm('mission.visionItems')"
              :key="index"
              class="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300"
            >
              <UIcon
                name="i-lucide-check"
                class="mt-0.5 size-4 shrink-0 text-brand-500"
              />
              {{ rt(item) }}
            </li>
          </ul>
        </UCard>

        <div class="relative overflow-hidden rounded-2xl bg-ink-950 p-7 text-white bg-[url('/worldlines.webp')] bg-scroll bg-cover bg-center">
          <div class="bg-radial-dots pointer-events-none absolute inset-0 text-white/5" />
          <p class="relative text-lg font-bold">
            {{ t('mission.impactTitle') }} <span class="text-brand-400">{{ t('mission.impactHighlight') }}</span>
          </p>
          <div class="relative mt-64 grid grid-cols-4 gap-6">
            <div
              v-for="item in impact"
              :key="item.key"
              class="flex flex-col items-center gap-2 text-center"
            >
              <UIcon
                :name="item.icon"
                class="size-6 text-brand-400"
              />
              <span class="whitespace-pre-line text-xs text-neutral-300">
                {{ t(`mission.impact.${item.key}`) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 flex flex-col items-center gap-4 rounded-2xl bg-white p-8 text-center ring-1 ring-neutral-200 sm:flex-row sm:text-left dark:bg-neutral-900 dark:ring-neutral-800">
        <UIcon
          name="i-lucide-globe-2"
          class="size-10 shrink-0 text-brand-600 dark:text-brand-400"
        />
        <div>
          <i18n-t
            keypath="mission.footerTitle"
            tag="p"
            class="font-bold text-neutral-900 dark:text-white"
          >
            <template #highlight>
              <span class="text-brand-600 dark:text-brand-400">{{ t('mission.footerHighlight') }}</span>
            </template>
          </i18n-t>
          <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {{ t('mission.footerText') }}
          </p>
        </div>
      </div>
    </UContainer>
  </section>
</template>
