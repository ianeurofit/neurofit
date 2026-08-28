<script setup lang="ts">
import { type EducationProgram, localized, localizedList } from '~/types/education'

const props = defineProps<{ program: EducationProgram }>()

defineEmits<{ open: [EducationProgram] }>()

const { t, locale } = useI18n()

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
</script>

<template>
  <article
    class="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 text-left transition-shadow hover:shadow-lg hover:shadow-brand-950/5 dark:border-white/10 dark:bg-ink-900"
  >
    <div class="flex items-start gap-4">
      <span
        class="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"
      >
        <UIcon
          :name="program.icon"
          class="size-6"
        />
      </span>
      <h3 class="text-base font-extrabold leading-snug tracking-tight">
        {{ title }}
      </h3>
    </div>

    <p class="mt-4 line-clamp-4 flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
      {{ objective }}
    </p>

    <div class="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-neutral-500">
      <span class="flex items-center gap-1.5">
        <UIcon
          name="i-lucide-clock"
          class="size-3.5 text-brand-500"
        />
        {{ duration }}
      </span>
      <span class="flex items-center gap-1.5">
        <UIcon
          name="i-lucide-monitor-smartphone"
          class="size-3.5 text-brand-500"
        />
        {{ t(`education.modalities.${program.modality}`) }}
      </span>
      <span class="flex items-center gap-1.5">
        <UIcon
          name="i-lucide-list-checks"
          class="size-3.5 text-brand-500"
        />
        {{ topics.length }} {{ t('education.topicsCount', topics.length) }}
      </span>
    </div>

    <UButton
      :label="t('education.seeMore')"
      icon="i-lucide-arrow-right"
      trailing
      color="neutral"
      variant="soft"
      class="mt-5 justify-center rounded-full"
      block
      @click="$emit('open', program)"
    />
  </article>
</template>
