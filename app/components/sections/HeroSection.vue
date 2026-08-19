<script setup lang="ts">
const { t } = useI18n()

const trust = [
  { icon: 'i-lucide-shield-check', key: 'hero.trust.science' },
  { icon: 'i-lucide-lock', key: 'hero.trust.privacy' },
  { icon: 'i-lucide-trending-up', key: 'hero.trust.prevention' },
]
</script>

<template>
  <section
    id="inicio"
    class="relative overflow-hidden bg-ink-950 text-white"
  >
    <div class="bg-radial-dots pointer-events-none absolute inset-0 text-white/5" />
    <div
      class="pointer-events-none absolute -right-40 top-1/2 size-[560px] -translate-y-1/2 rounded-full bg-brand-500/20 blur-[120px]"
    />

    <UContainer class="relative grid gap-12 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
      <div>
        <i18n-t
          keypath="hero.title"
          tag="h1"
          class="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.4rem]"
        >
          <template #brain>
            <span class="text-brand-400">{{ t('hero.titleBrain') }}</span>
          </template>
          <template #years>
            <span class="text-brand-400">{{ t('hero.titleYears') }}</span>
          </template>
        </i18n-t>

        <div class="mt-6 h-1 w-16 rounded-full bg-brand-400" />

        <i18n-t
          keypath="hero.subtitle"
          tag="p"
          class="mt-6 max-w-xl text-base leading-relaxed text-neutral-300 sm:text-lg"
        >
          <template #indicators>
            <span class="font-semibold text-brand-400">{{ t('hero.indicators') }}</span>
          </template>
          <template #alerts>
            <span class="font-semibold text-brand-400">{{ t('hero.alerts') }}</span>
          </template>
          <template #recommendations>
            <span class="font-semibold text-brand-400">{{ t('hero.recommendations') }}</span>
          </template>
        </i18n-t>

        <div class="mt-8 flex flex-wrap gap-4">
          <UButton
            :label="t('hero.ctaPrimary')"
            icon="i-lucide-brain-circuit"
            color="primary"
            size="xl"
            class="rounded-full px-6"
            href="#formulario"
          />
          <UButton
            :label="t('hero.ctaSecondary')"
            icon="i-lucide-play-circle"
            color="neutral"
            variant="outline"
            size="xl"
            class="rounded-full border-white/25 px-6 hover:bg-white/10"
            href="/demo"
          />
        </div>

        <div class="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div
            v-for="item in trust"
            :key="item.key"
            class="flex items-start gap-3"
          >
            <UIcon
              :name="item.icon"
              class="mt-0.5 size-6 shrink-0 text-brand-400"
            />
            <p class="whitespace-pre-line text-sm text-neutral-300">
              {{ t(item.key) }}
            </p>
          </div>
        </div>
      </div>

      <div class="relative flex items-center justify-center">
        <div class="absolute size-72 rounded-full bg-brand-500/10 blur-3xl sm:size-96" />
        <NuxtPicture
          format="avif,webp"
          src="/Brain-section-1.webp"
        />
      </div>
    </UContainer>
  </section>
</template>
