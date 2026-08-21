<script setup lang="ts">
import type { RoadmapNode, RoadmapNodeInput } from '~/types/roadmap'

definePageMeta({ layout: 'dashboard', titleKey: 'dashboard.titles.roadmap' })

const { t } = useI18n()
const toast = useToast()
const { isSuperuser } = useProfile()
const {
  nodes,
  pending,
  missingTable,
  errorMessage,
  fetchNodes,
  createNode,
  updateNode,
  deleteNode,
} = useRoadmap()

useSeoMeta({ title: () => `${t('dashboard.roadmap.title')} | Neurofit IA`, robots: 'noindex' })

await useAsyncData('roadmap-nodes-fetch', () => fetchNodes())

/** El superusuario alterna entre ver la línea de tiempo y gestionarla. */
const managing = ref(false)

const formOpen = ref(false)
const editing = ref<RoadmapNode | null>(null)
const formRef = ref<{ stopLoading: () => void } | null>(null)

function openCreate() {
  editing.value = null
  formOpen.value = true
}

function openEdit(node: RoadmapNode) {
  editing.value = node
  formOpen.value = true
}

async function onSubmit(input: RoadmapNodeInput) {
  try {
    if (editing.value) {
      await updateNode(editing.value.id, input)
      toast.add({ title: t('dashboard.roadmap.toast.updated'), color: 'primary' })
    }
    else {
      await createNode(input)
      toast.add({ title: t('dashboard.roadmap.toast.created'), color: 'primary' })
    }
    formOpen.value = false
  }
  catch (error) {
    toast.add({
      title: t('dashboard.roadmap.toast.error'),
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    })
    formRef.value?.stopLoading()
  }
}

/* ---------- Eliminación ---------- */
const deleteOpen = ref(false)
const deleting = ref<RoadmapNode | null>(null)
const removing = ref(false)

function openDelete(node: RoadmapNode) {
  deleting.value = node
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!deleting.value) return
  removing.value = true

  try {
    await deleteNode(deleting.value.id)
    toast.add({ title: t('dashboard.roadmap.toast.deleted'), color: 'primary' })
    deleteOpen.value = false
  }
  catch (error) {
    toast.add({
      title: t('dashboard.roadmap.toast.deleteError'),
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    })
  }
  finally {
    removing.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Encabezado -->
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="section-eyebrow">
          {{ t('dashboard.roadmap.eyebrow') }}
        </p>
        <h2 class="mt-1 text-2xl font-extrabold tracking-tight">
          {{ t('dashboard.roadmap.title') }}
        </h2>
        <p class="mt-1 text-sm text-neutral-500">
          {{ t('dashboard.roadmap.intro') }}
        </p>
      </div>

      <div
        v-if="isSuperuser"
        class="flex flex-wrap items-center gap-2"
      >
        <!-- Alternar vista / gestión -->
        <div class="inline-flex rounded-full border border-neutral-200 p-0.5 dark:border-white/10">
          <button
            type="button"
            class="rounded-full px-3 py-1.5 text-xs font-bold transition-colors"
            :class="!managing
              ? 'bg-brand-500 text-white'
              : 'text-neutral-500 hover:text-brand-600 dark:text-neutral-400 dark:hover:text-brand-400'"
            @click="managing = false"
          >
            {{ t('dashboard.roadmap.viewMode') }}
          </button>
          <button
            type="button"
            class="rounded-full px-3 py-1.5 text-xs font-bold transition-colors"
            :class="managing
              ? 'bg-brand-500 text-white'
              : 'text-neutral-500 hover:text-brand-600 dark:text-neutral-400 dark:hover:text-brand-400'"
            @click="managing = true"
          >
            {{ t('dashboard.roadmap.manageMode') }}
          </button>
        </div>

        <UButton
          :label="t('dashboard.roadmap.newNode')"
          icon="i-lucide-plus"
          color="primary"
          class="rounded-full"
          @click="openCreate"
        />
      </div>
    </div>

    <!-- Avisos -->
    <UAlert
      v-if="missingTable"
      color="warning"
      variant="soft"
      icon="i-lucide-database"
      :description="t('dashboard.roadmap.missingTable')"
      class="rounded-2xl"
    />
    <UAlert
      v-else-if="errorMessage"
      color="error"
      variant="soft"
      icon="i-lucide-triangle-alert"
      :description="errorMessage"
      class="rounded-2xl"
    />

    <!-- Contenido -->
    <p
      v-if="pending"
      class="text-sm text-neutral-500"
    >
      {{ t('dashboard.roadmap.loading') }}
    </p>

    <div
      v-else-if="!nodes.length && !missingTable"
      class="rounded-2xl border border-dashed border-neutral-200 px-6 py-12 text-center dark:border-white/10"
    >
      <UIcon
        name="i-lucide-map"
        class="mx-auto size-8 text-neutral-400"
      />
      <p class="mt-3 text-sm text-neutral-500">
        {{ isSuperuser ? t('dashboard.roadmap.emptyManage') : t('dashboard.roadmap.empty') }}
      </p>
    </div>

    <RoadmapTimeline
      v-else-if="nodes.length"
      :nodes="nodes"
      :editable="isSuperuser && managing"
      @edit="openEdit"
      @remove="openDelete"
    />

    <!-- Modal crear / editar -->
    <UModal
      v-model:open="formOpen"
      :title="editing ? t('dashboard.roadmap.form.editTitle') : t('dashboard.roadmap.form.createTitle')"
    >
      <template #body>
        <RoadmapNodeForm
          ref="formRef"
          :node="editing"
          @submit="onSubmit"
          @cancel="formOpen = false"
        />
      </template>
    </UModal>

    <!-- Modal eliminar -->
    <UModal
      v-model:open="deleteOpen"
      :title="t('dashboard.roadmap.actions.deleteTitle')"
    >
      <template #body>
        <p class="text-sm text-neutral-600 dark:text-neutral-300">
          {{ t('dashboard.roadmap.actions.deleteText', {
            title: deleting?.title ?? '',
            count: deleting?.items.length ?? 0,
          }) }}
        </p>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            :label="t('dashboard.roadmap.form.cancel')"
            color="neutral"
            variant="ghost"
            class="rounded-full"
            @click="deleteOpen = false"
          />
          <UButton
            :label="t('dashboard.roadmap.actions.confirmDelete')"
            color="error"
            class="rounded-full"
            :loading="removing"
            @click="confirmDelete"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
