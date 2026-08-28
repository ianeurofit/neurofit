<script setup lang="ts">
import {
  EDUCATION_LINES,
  EDUCATION_MODALITIES,
  type EducationLine,
  type EducationModality,
  type EducationProgram,
  type EducationProgramInput,
  toSlug,
} from '~/types/education'

const props = defineProps<{
  /** Programa a editar; si falta, el formulario crea uno nuevo. */
  program?: EducationProgram | null
}>()

const emit = defineEmits<{
  submit: [EducationProgramInput]
  cancel: []
}>()

const { t } = useI18n()

const isEdit = computed(() => Boolean(props.program))
const loading = ref(false)
/** Mientras no se toque a mano, el slug sigue al título. */
const slugTouched = ref(false)

const state = reactive({
  slug: '',
  line: 'talk' as EducationLine,
  position: 0,
  title: '',
  title_en: '',
  objective: '',
  objective_en: '',
  // Los temas se editan como texto: una línea por tema.
  topicsText: '',
  topicsEnText: '',
  duration: '60 a 90 minutos',
  duration_en: '',
  modality: 'both' as EducationModality,
  icon: 'i-lucide-brain',
  is_published: true,
})

watch(
  () => props.program,
  (program) => {
    state.slug = program?.slug ?? ''
    state.line = program?.line ?? 'talk'
    state.position = program?.position ?? 0
    state.title = program?.title ?? ''
    state.title_en = program?.title_en ?? ''
    state.objective = program?.objective ?? ''
    state.objective_en = program?.objective_en ?? ''
    state.topicsText = program?.topics.join('\n') ?? ''
    state.topicsEnText = program?.topics_en.join('\n') ?? ''
    state.duration = program?.duration ?? '60 a 90 minutos'
    state.duration_en = program?.duration_en ?? ''
    state.modality = program?.modality ?? 'both'
    state.icon = program?.icon ?? 'i-lucide-brain'
    state.is_published = program?.is_published ?? true
    slugTouched.value = Boolean(program)
  },
  { immediate: true },
)

watch(
  () => state.title,
  (title) => {
    if (!slugTouched.value) state.slug = toSlug(title)
  },
)

const lineOptions = computed(() =>
  EDUCATION_LINES.map(value => ({ value, label: t(`education.lines.${value}.name`) })),
)

const modalityOptions = computed(() =>
  EDUCATION_MODALITIES.map(value => ({ value, label: t(`education.modalities.${value}`) })),
)

function parseLines(value: string) {
  return value.split('\n').map(line => line.trim()).filter(Boolean)
}

function validate() {
  const errors: { name: string, message: string }[] = []
  if (!state.title.trim()) errors.push({ name: 'title', message: t('dashboard.education.errors.title') })
  if (!state.objective.trim()) errors.push({ name: 'objective', message: t('dashboard.education.errors.objective') })
  if (!state.duration.trim()) errors.push({ name: 'duration', message: t('dashboard.education.errors.duration') })
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(state.slug)) {
    errors.push({ name: 'slug', message: t('dashboard.education.errors.slug') })
  }
  if (!parseLines(state.topicsText).length) {
    errors.push({ name: 'topicsText', message: t('dashboard.education.errors.topics') })
  }
  return errors
}

/** Las traducciones vacías se guardan como null: la vista cae al español. */
function orNull(value: string) {
  return value.trim() ? value.trim() : null
}

async function onSubmit() {
  loading.value = true

  emit('submit', {
    slug: state.slug,
    line: state.line,
    position: Number(state.position) || 0,
    title: state.title.trim(),
    title_en: orNull(state.title_en),
    objective: state.objective.trim(),
    objective_en: orNull(state.objective_en),
    topics: parseLines(state.topicsText),
    topics_en: parseLines(state.topicsEnText),
    duration: state.duration.trim(),
    duration_en: orNull(state.duration_en),
    modality: state.modality,
    icon: state.icon.trim() || 'i-lucide-brain',
    is_published: state.is_published,
  })

  loading.value = false
}

function stopLoading() {
  loading.value = false
}

/** El padre la llama tras un fallo para reactivar el botón. */
defineExpose({ stopLoading })
</script>

<template>
  <UForm
    :state="state"
    :validate="validate"
    class="space-y-5"
    @submit="onSubmit"
  >
    <UFormField
      :label="t('dashboard.education.form.title')"
      name="title"
      required
    >
      <UInput
        v-model="state.title"
        size="lg"
        class="w-full"
      />
    </UFormField>

    <UFormField
      :label="t('dashboard.education.form.titleEn')"
      :help="t('dashboard.education.form.translationHelp')"
      name="title_en"
    >
      <UInput
        v-model="state.title_en"
        size="lg"
        class="w-full"
      />
    </UFormField>

    <div class="grid gap-5 sm:grid-cols-2">
      <UFormField
        :label="t('dashboard.education.form.line')"
        name="line"
      >
        <USelectMenu
          v-model="state.line"
          :items="lineOptions"
          value-key="value"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <UFormField
        :label="t('dashboard.education.form.modality')"
        name="modality"
      >
        <USelectMenu
          v-model="state.modality"
          :items="modalityOptions"
          value-key="value"
          size="lg"
          class="w-full"
        />
      </UFormField>
    </div>

    <div class="grid gap-5 sm:grid-cols-2">
      <UFormField
        :label="t('dashboard.education.form.duration')"
        name="duration"
        required
      >
        <UInput
          v-model="state.duration"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <UFormField
        :label="t('dashboard.education.form.durationEn')"
        name="duration_en"
      >
        <UInput
          v-model="state.duration_en"
          size="lg"
          class="w-full"
        />
      </UFormField>
    </div>

    <UFormField
      :label="t('dashboard.education.form.objective')"
      name="objective"
      required
    >
      <UTextarea
        v-model="state.objective"
        :rows="3"
        class="w-full"
      />
    </UFormField>

    <UFormField
      :label="t('dashboard.education.form.objectiveEn')"
      :help="t('dashboard.education.form.translationHelp')"
      name="objective_en"
    >
      <UTextarea
        v-model="state.objective_en"
        :rows="3"
        class="w-full"
      />
    </UFormField>

    <UFormField
      :label="t('dashboard.education.form.topics')"
      :help="t('dashboard.education.form.topicsHelp')"
      name="topicsText"
      required
    >
      <UTextarea
        v-model="state.topicsText"
        :rows="5"
        class="w-full"
      />
    </UFormField>

    <UFormField
      :label="t('dashboard.education.form.topicsEn')"
      :help="t('dashboard.education.form.translationHelp')"
      name="topicsEnText"
    >
      <UTextarea
        v-model="state.topicsEnText"
        :rows="5"
        class="w-full"
      />
    </UFormField>

    <div class="grid gap-5 sm:grid-cols-2">
      <UFormField
        :label="t('dashboard.education.form.slug')"
        :help="t('dashboard.education.form.slugHelp')"
        name="slug"
        required
      >
        <UInput
          v-model="state.slug"
          size="lg"
          class="w-full"
          @input="slugTouched = true"
        />
      </UFormField>

      <UFormField
        :label="t('dashboard.education.form.position')"
        :help="t('dashboard.education.form.positionHelp')"
        name="position"
      >
        <UInput
          v-model.number="state.position"
          type="number"
          size="lg"
          class="w-full"
        />
      </UFormField>
    </div>

    <div class="grid gap-5 sm:grid-cols-2">
      <UFormField
        :label="t('dashboard.education.form.icon')"
        :help="t('dashboard.education.form.iconHelp')"
        name="icon"
      >
        <UInput
          v-model="state.icon"
          size="lg"
          class="w-full"
        >
          <template #trailing>
            <UIcon
              :name="state.icon"
              class="size-5 text-brand-500"
            />
          </template>
        </UInput>
      </UFormField>

      <UFormField
        :label="t('dashboard.education.form.published')"
        :help="t('dashboard.education.form.publishedHelp')"
        name="is_published"
      >
        <USwitch v-model="state.is_published" />
      </UFormField>
    </div>

    <div class="flex flex-wrap justify-end gap-2 pt-1">
      <UButton
        :label="t('dashboard.education.form.cancel')"
        color="neutral"
        variant="ghost"
        class="rounded-full"
        @click="emit('cancel')"
      />
      <UButton
        type="submit"
        :label="isEdit ? t('dashboard.education.form.save') : t('dashboard.education.form.create')"
        color="primary"
        class="rounded-full"
        :loading="loading"
      />
    </div>
  </UForm>
</template>
