<script setup lang="ts">
import { EDUCATION_LINE_ICONS, EDUCATION_LINES, type EducationLine, type EducationProgram, localized } from '~/types/education'

const { t, locale } = useI18n()
const { programs, pending, missingTable, fetchPrograms } = useEducation()

await useAsyncData('education-programs-fetch', () => fetchPrograms())

useSeoMeta({
  title: () => t('seo.education.title'),
  description: () => t('seo.education.description'),
  ogTitle: () => t('seo.education.title'),
  ogDescription: () => t('seo.education.description'),
  ogImage: '/neurofit-logo-tealgray-.png',
  ogType: 'website',
  ogUrl: 'https://neurofitia.com/educacion',
  twitterCard: 'summary_large_image',
  twitterTitle: () => t('seo.education.title'),
  twitterDescription: () => t('seo.education.description'),
  twitterImage: '/neurofit-logo-tealgray-.png',
})

/** Solo se listan las líneas que tengan algo publicado. */
const grouped = computed(() =>
  EDUCATION_LINES
    .map(line => ({ line, items: programs.value.filter(p => p.line === line) }))
    .filter(group => group.items.length > 0),
)

const reasons = ['evidence', 'practical', 'tailored', 'sustainable', 'integration']

/* ---------- Ventana emergente de detalle ---------- */
const selected = ref<EducationProgram | null>(null)
const detailOpen = ref(false)

function openProgram(program: EducationProgram) {
  selected.value = program
  detailOpen.value = true
}

function lineTitle(line: EducationLine) {
  return t(`education.lines.${line}.name`)
}
</script>

<template>
  <div>
    <LayoutAppHeaderBasic />

    <main>
      <!-- Portada -->
      <section class="border-b border-neutral-200 bg-neutral-50 py-16 sm:py-20 dark:border-white/10 dark:bg-ink-950">
        <UContainer class="max-w-3xl text-center">
          <p class="section-eyebrow text-brand-600 dark:text-brand-400">
            {{ t('education.eyebrow') }}
          </p>
          <h1 class="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {{ t('education.title') }}
          </h1>
          <p class="mt-3 text-base font-semibold text-brand-600 dark:text-brand-400">
            {{ t('education.tagline') }}
          </p>
          <p class="mt-5 text-sm leading-relaxed text-neutral-600 sm:text-base dark:text-neutral-300">
            {{ t('education.intro') }}
          </p>

          <div class="mt-8 flex flex-wrap justify-center gap-3">
            <span
              class="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold dark:border-white/10 dark:bg-ink-900"
            >
              <UIcon
                name="i-lucide-clock"
                class="size-4 text-brand-500"
              />
              {{ t('education.defaultDuration') }}
            </span>
            <span
              class="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold dark:border-white/10 dark:bg-ink-900"
            >
              <UIcon
                name="i-lucide-monitor-smartphone"
                class="size-4 text-brand-500"
              />
              {{ t('education.modalities.both') }}
            </span>
          </div>
        </UContainer>
      </section>

      <!-- Líneas de la oferta -->
      <section class="py-16">
        <UContainer>
          <h2 class="text-center text-2xl font-extrabold tracking-tight">
            {{ t('education.linesTitle') }}
          </h2>
          <p class="mx-auto mt-3 max-w-2xl text-center text-sm text-neutral-600 dark:text-neutral-300">
            {{ t('education.linesIntro') }}
          </p>

          <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div
              v-for="line in EDUCATION_LINES"
              :key="line"
              class="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-white/10 dark:bg-ink-900"
            >
              <UIcon
                :name="EDUCATION_LINE_ICONS[line]"
                class="size-6 text-brand-500"
              />
              <h3 class="mt-3 text-sm font-extrabold">
                {{ lineTitle(line) }}
              </h3>
              <p class="mt-1.5 text-xs leading-relaxed text-neutral-500">
                {{ t(`education.lines.${line}.description`) }}
              </p>
            </div>
          </div>
        </UContainer>
      </section>

      <!-- Catálogo -->
      <section
        id="catalogo"
        class="border-t border-neutral-200 bg-neutral-50 py-16 dark:border-white/10 dark:bg-ink-950"
      >
        <UContainer>
          <UAlert
            v-if="missingTable"
            color="warning"
            variant="soft"
            icon="i-lucide-database"
            :description="t('education.missingTable')"
            class="rounded-2xl"
          />

          <p
            v-else-if="pending"
            class="text-center text-sm text-neutral-500"
          >
            {{ t('education.loading') }}
          </p>

          <div
            v-else-if="!grouped.length"
            class="rounded-2xl border border-dashed border-neutral-300 px-6 py-12 text-center dark:border-white/10"
          >
            <UIcon
              name="i-lucide-graduation-cap"
              class="mx-auto size-8 text-neutral-400"
            />
            <p class="mt-3 text-sm text-neutral-500">
              {{ t('education.empty') }}
            </p>
          </div>

          <div
            v-for="(group, index) in grouped"
            v-else
            :key="group.line"
            :class="index > 0 ? 'mt-16' : ''"
          >
            <div class="flex flex-wrap items-baseline justify-between gap-3">
              <h2 class="text-2xl font-extrabold tracking-tight">
                {{ lineTitle(group.line) }}
              </h2>
              <span class="text-sm text-neutral-500">
                {{ group.items.length }} {{ t('education.programsCount', group.items.length) }}
              </span>
            </div>

            <div class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <EducationProgramCard
                v-for="program in group.items"
                :id="program.slug"
                :key="program.id"
                :program="program"
                class="scroll-mt-28"
                @open="openProgram"
              />
            </div>
          </div>
        </UContainer>
      </section>

      <!-- Por qué elegir Neurofit -->
      <section class="py-16">
        <UContainer class="max-w-3xl">
          <h2 class="text-center text-2xl font-extrabold tracking-tight">
            {{ t('education.whyTitle') }}
          </h2>
          <ul class="mt-8 grid gap-3 sm:grid-cols-2">
            <li
              v-for="reason in reasons"
              :key="reason"
              class="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 text-sm dark:border-white/10 dark:bg-ink-900"
            >
              <UIcon
                name="i-lucide-badge-check"
                class="mt-0.5 size-5 shrink-0 text-brand-500"
              />
              {{ t(`education.why.${reason}`) }}
            </li>
          </ul>
          <p class="mt-8 text-center text-sm text-neutral-600 dark:text-neutral-300">
            {{ t('education.customizable') }}
          </p>
        </UContainer>
      </section>
    </main>

    <!-- Detalle en ventana emergente -->
    <UModal
      v-model:open="detailOpen"
      :title="selected ? localized(selected.title, selected.title_en, locale) : ''"
      :ui="{ content: 'max-w-2xl' }"
    >
      <template #body>
        <EducationProgramDetail
          v-if="selected"
          :program="selected"
        />
      </template>
    </UModal>

    <LazySharedWhatsappFloat />
    <LayoutAppFooter />
  </div>
</template>
