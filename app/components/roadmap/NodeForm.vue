<script setup lang="ts">
import { formatCop, ROADMAP_STATUSES, type RoadmapNode, type RoadmapNodeInput, type RoadmapStatus } from '~/types/roadmap'

const props = defineProps<{
  /** Nodo a editar; si falta, el formulario crea uno nuevo. */
  node?: RoadmapNode | null
}>()

const emit = defineEmits<{
  submit: [RoadmapNodeInput]
  cancel: []
}>()

const { t, locale } = useI18n()

const isEdit = computed(() => Boolean(props.node))
const loading = ref(false)

/** Fila editable: cada hito lleva su valor en COP. */
interface ItemRow {
  text: string
  amount: number
}

function emptyRow(): ItemRow {
  return { text: '', amount: 0 }
}

const state = reactive({
  title: '',
  event_date: '',
  position: 0,
  status: 'planned' as RoadmapStatus,
  items: [emptyRow()] as ItemRow[],
})

watch(
  () => props.node,
  (node) => {
    state.title = node?.title ?? ''
    state.event_date = node?.event_date ?? ''
    state.position = node?.position ?? 0
    state.status = node?.status ?? 'planned'
    state.items = node?.items.length
      ? node.items.map(item => ({ text: item.text, amount: item.amount }))
      : [emptyRow()]
  },
  { immediate: true },
)

function addItem() {
  state.items.push(emptyRow())
}

function removeItem(index: number) {
  state.items.splice(index, 1)
  if (!state.items.length) state.items.push(emptyRow())
}

const total = computed(() =>
  state.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
)

const totalLabel = computed(() => formatCop(total.value, locale.value))

const statusOptions = computed(() =>
  ROADMAP_STATUSES.map(value => ({
    value,
    label: t(`dashboard.roadmap.statuses.${value}`),
  })),
)

function parseItems() {
  return state.items
    .map(item => ({ text: item.text.trim(), amount: Math.max(0, Number(item.amount) || 0) }))
    .filter(item => item.text)
}

function validate() {
  const errors: { name: string, message: string }[] = []
  if (!state.title.trim()) errors.push({ name: 'title', message: t('dashboard.roadmap.errors.title') })
  if (!state.event_date) errors.push({ name: 'event_date', message: t('dashboard.roadmap.errors.date') })
  if (!parseItems().length) errors.push({ name: 'items', message: t('dashboard.roadmap.errors.items') })
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
      name="items"
      required
    >
      <div class="space-y-2">
        <div
          v-for="(item, index) in state.items"
          :key="index"
          class="flex items-center gap-2"
        >
          <UInput
            v-model="item.text"
            size="lg"
            :placeholder="t('dashboard.roadmap.form.itemsPlaceholder')"
            class="flex-1"
          />
          <UInput
            v-model.number="item.amount"
            type="number"
            min="0"
            step="1000"
            size="lg"
            :aria-label="t('dashboard.roadmap.form.itemAmount')"
            :placeholder="t('dashboard.roadmap.form.itemAmountPlaceholder')"
            class="w-40 shrink-0"
          />
          <UButton
            icon="i-lucide-trash-2"
            color="neutral"
            variant="ghost"
            size="sm"
            class="rounded-full"
            :aria-label="t('dashboard.roadmap.form.removeItem')"
            @click="removeItem(index)"
          />
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
          <UButton
            icon="i-lucide-plus"
            :label="t('dashboard.roadmap.form.addItem')"
            color="neutral"
            variant="soft"
            size="sm"
            class="rounded-full"
            @click="addItem"
          />
          <span class="text-sm text-neutral-500">
            {{ t('dashboard.roadmap.form.total') }}
            <strong class="tabular-nums text-neutral-900 dark:text-white">{{ totalLabel }}</strong>
          </span>
        </div>
      </div>
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
