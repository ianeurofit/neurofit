<script setup lang="ts">
const { t } = useI18n()

const benefits = [
  { icon: 'i-lucide-shield-check', key: 'prevention' },
  { icon: 'i-lucide-trending-up', key: 'optimized' },
  { icon: 'i-lucide-heart', key: 'wellbeing' },
  { icon: 'i-lucide-shield', key: 'decisions' },
  { icon: 'i-lucide-users', key: 'organizations' },
  { icon: 'i-lucide-plus', key: 'professionals' },
  { icon: 'i-lucide-globe', key: 'global' },
  { icon: 'i-lucide-leaf', key: 'purpose' },
]

const closing = [
  { icon: 'i-lucide-brain', key: 'minds' },
  { icon: 'i-lucide-heart', key: 'lives' },
  { icon: 'i-lucide-users', key: 'communities' },
  { icon: 'i-lucide-globe', key: 'world' },
]
</script>

<template>
  <section class="py-20 lg:py-28">
    <UContainer>
      <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <UiSectionEyebrow :label="t('benefits.eyebrow')" />
          <i18n-t
            keypath="benefits.title"
            tag="h2"
            class="mt-3 max-w-lg text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl dark:text-white"
          >
            <template #highlight>
              <span class="text-brand-600 dark:text-brand-400">{{ t('benefits.titleHighlight') }}</span>
            </template>
          </i18n-t>
        </div>
        <p class="max-w-md text-neutral-600 dark:text-neutral-400">
          {{ t('benefits.intro') }}
        </p>
      </div>

      <div class="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <UiFeatureCard
          v-for="item in benefits"
          :key="item.key"
          :icon="item.icon"
          :title="t(`benefits.items.${item.key}.title`)"
          :description="t(`benefits.items.${item.key}.description`)"
        />
      </div>

      <div class="mt-8 flex flex-col gap-6 rounded-2xl bg-neutral-50 p-8 lg:flex-row lg:items-center lg:justify-between dark:bg-neutral-900/40">
        <div class="flex items-start gap-4">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
            <UIcon
              name="i-lucide-target"
              class="size-6"
            />
          </div>
          <i18n-t
            keypath="benefits.closingText"
            tag="p"
            class="text-neutral-700 dark:text-neutral-300"
          >
            <template #future>
              <span class="font-bold text-neutral-900 dark:text-white">{{ t('benefits.closingFuture') }}</span>
            </template>
          </i18n-t>
        </div>
        <div class="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div
            v-for="item in closing"
            :key="item.key"
            class="flex flex-col items-center gap-2 text-center"
          >
            <UIcon
              :name="item.icon"
              class="size-6 text-brand-600 dark:text-brand-400"
            />
            <span class="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              {{ t(`benefits.closing.${item.key}`) }}
            </span>
          </div>
        </div>
      </div>
    </UContainer>
  </section>
</template>
