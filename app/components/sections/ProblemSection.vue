<script setup lang="ts">
const { t } = useI18n()

const problems = [
  { icon: 'i-lucide-brain', key: 'cognitive', color: 'brand' as const },
  { icon: 'i-lucide-frown', key: 'stress', color: 'brand' as const },
  { icon: 'i-lucide-flame', key: 'burnout', color: 'orange' as const },
  { icon: 'i-lucide-heart-pulse', key: 'mental', color: 'blue' as const },
  { icon: 'i-lucide-trending-down', key: 'quality', color: 'violet' as const },
]
</script>

<template>
  <section class="bg-neutral-50 py-20 dark:bg-neutral-900/40 lg:py-28">
    <UContainer>
      <div class="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <UiSectionEyebrow :label="t('problem.eyebrow')" />
          <i18n-t
            keypath="problem.title"
            tag="h2"
            class="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl dark:text-white"
          >
            <template #highlight>
              <span class="text-brand-600 dark:text-brand-400">{{ t('problem.titleHighlight') }}</span>
            </template>
          </i18n-t>

          <div class="mt-6 space-y-4 text-neutral-600 dark:text-neutral-400">
            <p>{{ t('problem.p1') }}</p>
            <p>{{ t('problem.p2') }}</p>
            <i18n-t
              keypath="problem.p3"
              tag="p"
            >
              <template #highlight>
                <span class="font-semibold text-neutral-900 dark:text-white">
                  {{ t('problem.p3Highlight') }}
                </span>
              </template>
            </i18n-t>
          </div>

          <div class="mt-6 h-px w-16 bg-neutral-300 dark:bg-neutral-700" />

          <UAlert
            icon="i-lucide-alert-triangle"
            color="primary"
            variant="soft"
            class="mt-6 rounded-xl"
          >
            <template #description>
              <i18n-t
                keypath="problem.alert"
                tag="span"
                class="text-neutral-700 dark:text-neutral-300"
              >
                <template #reactive>
                  <span class="font-bold">{{ t('problem.alertReactive') }}</span>
                </template>
                <template #preventive>
                  <span class="font-bold text-brand-600 dark:text-brand-400">{{ t('problem.alertPreventive') }}</span>
                </template>
              </i18n-t>
            </template>
          </UAlert>
        </div>

        <div class="relative flex items-center justify-center">
          <NuxtPicture
            format="avif,webp"
            src="/neurofit-person-pefil-1.webp"
          />
        </div>
      </div>

      <div class="mt-14 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
        <UiFeatureCard
          v-for="item in problems"
          :key="item.key"
          :icon="item.icon"
          :title="t(`problem.items.${item.key}.title`)"
          :description="t(`problem.items.${item.key}.description`)"
          :color="item.color"
        />
      </div>
    </UContainer>
  </section>
</template>
