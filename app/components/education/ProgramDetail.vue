<script setup lang="ts">
import { type EducationProgram, localized, localizedList } from '~/types/education'

const props = defineProps<{ program: EducationProgram }>()

const { t, locale } = useI18n()
const url = useRequestURL()

const title = computed(() => localized(props.program.title, props.program.title_en, locale.value))
const objective = computed(() =>
  localized(props.program.objective, props.program.objective_en, locale.value),
)
const topics = computed(() =>
  localizedList(props.program.topics, props.program.topics_en, locale.value),
)
const duration = computed(() =>
  localized(props.program.duration, props.program.duration_en, locale.value),
)

/** Enlace de solicitud: el mensaje ya nombra la conferencia y su URL. */
const requestUrl = computed(() =>
  whatsappLink(
    `${t('education.whatsappMessage', { title: title.value })} ${url.origin}${url.pathname}#${props.program.slug}`,
  ),
)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-start gap-4">
      <span
        class="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"
      >
        <UIcon
          :name="program.icon"
          class="size-6"
        />
      </span>
      <div>
        <p class="section-eyebrow text-brand-600 dark:text-brand-400">
          {{ t(`education.lines.${program.line}.name`) }}
        </p>
        <p class="mt-1 text-sm text-neutral-500">
          {{ t('education.detailSubtitle') }}
        </p>
      </div>
    </div>

    <div class="flex flex-wrap gap-2">
      <span
        class="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600 dark:bg-white/5 dark:text-neutral-300"
      >
        <UIcon
          name="i-lucide-clock"
          class="size-3.5 text-brand-500"
        />
        {{ duration }}
      </span>
      <span
        class="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600 dark:bg-white/5 dark:text-neutral-300"
      >
        <UIcon
          name="i-lucide-monitor-smartphone"
          class="size-3.5 text-brand-500"
        />
        {{ t(`education.modalities.${program.modality}`) }}
      </span>
    </div>

    <div>
      <h4 class="text-xs font-bold uppercase tracking-[0.12em] text-neutral-400">
        {{ t('education.objective') }}
      </h4>
      <p class="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
        {{ objective }}
      </p>
    </div>

    <div v-if="topics.length">
      <h4 class="text-xs font-bold uppercase tracking-[0.12em] text-neutral-400">
        {{ t('education.topics') }}
      </h4>
      <ul class="mt-2 space-y-2">
        <li
          v-for="topic in topics"
          :key="topic"
          class="flex items-start gap-2.5 text-sm text-neutral-600 dark:text-neutral-300"
        >
          <UIcon
            name="i-lucide-check"
            class="mt-0.5 size-4 shrink-0 text-brand-500"
          />
          {{ topic }}
        </li>
      </ul>
    </div>

    <div class="rounded-2xl bg-brand-50 p-5 dark:bg-brand-900/20">
      <p class="text-sm font-semibold">
        {{ t('education.requestTitle') }}
      </p>
      <p class="mt-1 text-xs text-neutral-600 dark:text-neutral-300">
        {{ t('education.requestText') }}
      </p>
      <UButton
        :to="requestUrl"
        target="_blank"
        rel="noopener"
        :label="t('education.requestCta')"
        icon="i-simple-icons-whatsapp"
        color="primary"
        size="lg"
        class="mt-4 justify-center rounded-full"
        block
      />
    </div>
  </div>
</template>
