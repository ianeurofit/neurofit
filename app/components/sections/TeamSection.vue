<script setup lang="ts">
const { t } = useI18n()

const values = [
  { icon: 'i-lucide-users', key: 'human' },
  { icon: 'i-lucide-heart', key: 'science' },
  { icon: 'i-lucide-globe', key: 'community' },
  { icon: 'i-lucide-handshake', key: 'innovation' },
]

const experience = [
  { icon: 'i-lucide-graduation-cap', key: 'scientific' },
  { icon: 'i-lucide-flask-conical', key: 'tech' },
  { icon: 'i-lucide-users', key: 'clinical' },
  { icon: 'i-lucide-globe', key: 'innovation' },
]

const stats = [
  { icon: 'i-lucide-users', value: 50, prefix: '+', key: 'experts' },
  { icon: 'i-lucide-globe', value: 25, prefix: '+', key: 'countries' },
  { icon: 'i-lucide-user-check', value: 100, prefix: '+', suffix: 'K', key: 'people' },
  { icon: 'i-lucide-database', value: 1, prefix: '+', suffix: 'M', key: 'data' },
  { icon: 'i-lucide-shield-check', value: 100, suffix: '%', key: 'ethics' },
]
</script>

<template>
  <section class="bg-neutral-50 py-20 dark:bg-neutral-900/40 lg:py-28">
    <UContainer>
      <UiSectionEyebrow :label="t('team.eyebrow')" />
      <div class="mt-12 grid gap-10 lg:grid-cols-[2fr_1.6fr]">
        <div>
          <i18n-t
            keypath="team.title"
            tag="h2"
            class="mt-3 max-w-xl text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl dark:text-white"
          >
            <template #highlight>
              <span class="text-brand-600 dark:text-brand-400">{{ t('team.titleHighlight') }}</span>
            </template>
          </i18n-t>
          <p class="mt-4 max-w-2xl text-neutral-600 dark:text-neutral-400">
            {{ t('team.intro') }}
          </p>
        </div>
        <div>
          <i18n-t
            keypath="team.secondTitle"
            tag="h2"
            class="mt-3 max-w-xl text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl dark:text-white"
          >
            <template #highlight>
              <span class="text-brand-600 dark:text-brand-400">{{ t('team.titleHighlight') }}</span>
            </template>
          </i18n-t>
          <p class="mt-4 max-w-2xl text-neutral-600 dark:text-neutral-400">
            {{ t('team.secondIntro') }}
          </p>
        </div>
      </div>

      <div class="mt-12 grid gap-10 lg:grid-cols-[1fr_2.3fr_1fr]">
        <div class="space-y-6">
          <div
            v-for="item in values"
            :key="item.key"
            class="flex items-start gap-3"
          >
            <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-brand-600 ring-1 ring-neutral-200 dark:bg-neutral-900 dark:text-brand-400 dark:ring-neutral-800">
              <UIcon
                :name="item.icon"
                class="size-4.5"
              />
            </div>
            <div>
              <p class="font-bold text-neutral-900 dark:text-white">
                {{ t(`team.values.${item.key}.title`) }}
              </p>
              <p class="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                {{ t(`team.values.${item.key}.description`) }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex flex-col items-center text-center">
          <NuxtPicture
            format="avif,webp"
            src="/team-ia.webp"
          />
        </div>

        <div>
          <div class="space-y-5">
            <div
              v-for="item in experience"
              :key="item.key"
              class="flex items-start gap-3"
            >
              <UIcon
                :name="item.icon"
                class="mt-0.5 size-5 shrink-0 text-brand-600 dark:text-brand-400"
              />
              <div>
                <p class="font-semibold text-neutral-900 dark:text-white">
                  {{ t(`team.experience.${item.key}.title`) }}
                </p>
                <p class="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                  {{ t(`team.experience.${item.key}.description`) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-12 rounded-2xl bg-ink-950 p-8 text-white">
        <p class="mb-6 text-sm font-bold tracking-wide text-brand-400">
          {{ t('team.statsTitle') }}
        </p>
        <div class="grid grid-cols-2 gap-6 sm:grid-cols-5">
          <UiStatCounter
            v-for="stat in stats"
            :key="stat.key"
            :icon="stat.icon"
            :value="stat.value"
            :prefix="stat.prefix"
            :suffix="stat.suffix"
            :label="t(`team.stats.${stat.key}`)"
            class="!bg-transparent !p-0 [&_svg]:text-brand-400 [&_p:first-of-type]:text-white [&_p:last-of-type]:text-neutral-400"
          />
        </div>
      </div>
      <UCard
        :ui="{ root: 'mt-10 bg-white/5 ring-white/10', body: 'p-8' }"
        class="text-center"
      >
        <UIcon
          name="i-lucide-quote"
          class="mx-auto size-8 text-brand-400"
        />
        <p class="mt-3 text-lg font-medium">
          {{ t('team.quote') }}
        </p>
        <h3 class="mt-5 text-xl font-extrabold text-neutral-900 dark:text-white">
          {{ t('team.founderName') }}
        </h3>
        <p class="text-sm font-medium text-brand-600 dark:text-brand-400">
          {{ t('team.founderRole') }}
        </p>
        <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {{ t('team.founderTitle') }}
        </p>
      </UCard>
    </UContainer>
  </section>
</template>
