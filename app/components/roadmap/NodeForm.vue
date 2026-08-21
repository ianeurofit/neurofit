<script setup lang="ts">
import { ROADMAP_STATUSES, type RoadmapNode, type RoadmapNodeInput, type RoadmapStatus } from '~/types/roadmap'

const props = defineProps<{
  /** Nodo a editar; si falta, el formulario crea uno nuevo. */
  node?: RoadmapNode | null
}>()

const emit = defineEmits<{
  submit: [RoadmapNodeInput]
  cancel: []
}>()

const { t } = useI18n()

const isEdit = computed(() => Boolean(props.node))
const loading = ref(false)

const state = reactive({
  title: '',
  event_date: '',
  position: 0,
  status: 'planned' as RoadmapStatus,
  // Los hitos se editan como texto: una línea por hito.
  itemsText: '',
})

watch(
  () => props.node,
  (node) => {
    state.title = node?.title ?? ''
    state.event_date = node?.event_date ?? ''
    state.position = node?.position ?? 0
    state.status = node?.status ?? 'planned'
    state.itemsText = node?.items.join('\n') ?? ''
  },
  { immediate: true },
)

const statusOptions = computed(() =>
  ROADMAP_STATUSES.map(value => ({
    value,
    label: t(`dashboard.roadmap.statuses.${value}`),
  })),
)

function parseItems() {
  return state.itemsText
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
}

function validate() {
  const errors: { name: string, message: string }[] = []
  if (!state.title.trim()) errors.push({ name: 'title', message: t('dashboard.roadmap.errors.title') })
  if (!state.event_date) errors.push({ name: 'event_date', message: t('dashboard.roadmap.errors.date') })
  if (!parseItems().length) errors.push({ name: 'itemsText', message: t('dashboard.roadmap.errors.items') })
  return errors
}

async function onSubmit() {
  loading.value = true

  emit('submit', {
    title: state.title.trim(),
    event_date: state.event_date,
    position: Number(state.position) || 0,
    status: state.status,
    items: parseItems(),
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
      :label="t('dashboard.roadmap.form.label')"
      :help="t('dashboard.roadmap.form.labelHelp')"
      name="title"
      required
    >
      <UInput
        v-model="state.title"
        size="lg"
        icon="i-lucide-tag"
        :placeholder="t('dashboard.roadmap.form.labelPlaceholder')"
        class="w-full"
      />
    </UFormField>

    <div class="grid gap-5 sm:grid-cols-2">
      <UFormField
        :label="t('dashboard.roadmap.form.date')"
        :help="t('dashboard.roadmap.form.dateHelp')"
        name="event_date"
        required
      >
        <UInput
          v-model="state.event_date"
          type="date"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <UFormField
        :label="t('dashboard.roadmap.form.status')"
        name="status"
      >
        <USelectMenu
          v-model="state.status"
          :items="statusOptions"
          value-key="value"
          size="lg"
          class="w-full"
        />
      </UFormField>
    </div>

    <UFormField
      :label="t('dashboard.roadmap.form.position')"
      :help="t('dashboard.roadmap.form.positionHelp')"
      name="position"
    >
      <UInput
        v-model.number="state.position"
        type="number"
        size="lg"
        class="w-full"
      />
    </UFormField>

    <UFormField
      :label="t('dashboard.roadmap.form.items')"
      :help="t('dashboard.roadmap.form.itemsHelp')"
      name="itemsText"
      required
    >
      <UTextarea
        v-model="state.itemsText"
        :rows="6"
        :placeholder="t('dashboard.roadmap.form.itemsPlaceholder')"
        class="w-full"
      />
    </UFormField>

    <div class="flex flex-wrap justify-end gap-2 pt-1">
      <UButton
        :label="t('dashboard.roadmap.form.cancel')"
        color="neutral"
        variant="ghost"
        class="rounded-full"
        @click="emit('cancel')"
      />
      <UButton
        type="submit"
        :label="isEdit ? t('dashboard.roadmap.form.save') : t('dashboard.roadmap.form.create')"
        color="primary"
        class="rounded-full"
        :loading="loading"
      />
    </div>
  </UForm>
</template>
