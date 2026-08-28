<script setup lang="ts">
import { EDUCATION_LINES, type EducationProgram, type EducationProgramInput, localized } from '~/types/education'

definePageMeta({ layout: 'dashboard', titleKey: 'dashboard.titles.education' })

const { t, locale } = useI18n()
const localePath = useLocalePath()
const toast = useToast()
const {
  programs,
  pending,
  missingTable,
  errorMessage,
  fetchPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
} = useEducation()

useSeoMeta({ title: () => `${t('dashboard.education.title')} | Neurofit IA`, robots: 'noindex' })

await useAsyncData('education-programs-admin', () => fetchPrograms())

const grouped = computed(() =>
  EDUCATION_LINES
    .map(line => ({ line, items: programs.value.filter(p => p.line === line) }))
    .filter(group => group.items.length > 0),
)

function titleOf(program: EducationProgram) {
  return localized(program.title, program.title_en, locale.value)
}

/* ---------- Crear / editar ---------- */
const formOpen = ref(false)
const editing = ref<EducationProgram | null>(null)
const formRef = ref<{ stopLoading: () => void } | null>(null)

function openCreate() {
  editing.value = null
  formOpen.value = true
}

function openEdit(program: EducationProgram) {
  editing.value = program
  formOpen.value = true
}

async function onSubmit(input: EducationProgramInput) {
  try {
    if (editing.value) {
      await updateProgram(editing.value.id, input)
      toast.add({ title: t('dashboard.education.toast.updated'), color: 'primary' })
    }
    else {
      await createProgram(input)
      toast.add({ title: t('dashboard.education.toast.created'), color: 'primary' })
    }
    formOpen.value = false
  }
  catch (error) {
    toast.add({
      title: t('dashboard.education.toast.error'),
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    })
    formRef.value?.stopLoading()
  }
}

/** Publicar o despublicar sin abrir el formulario. */
async function togglePublished(program: EducationProgram) {
  try {
    await updateProgram(program.id, { is_published: !program.is_published })
    toast.add({ title: t('dashboard.education.toast.updated'), color: 'primary' })
  }
  catch (error) {
    toast.add({
      title: t('dashboard.education.toast.error'),
      description: error instanceof Error ? error.message : undefined,
      color: 'error',
    })
  }
}

/* ---------- Eliminación ---------- */
const deleteOpen = ref(false)
const deleting = ref<EducationProgram | null>(null)
const removing = ref(false)

function openDelete(program: EducationProgram) {
  deleting.value = program
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!deleting.value) return
  removing.value = true

  try {
    await deleteProgram(deleting.value.id)
    toast.add({ title: t('dashboard.education.toast.deleted'), color: 'primary' })
    deleteOpen.value = false
  }
  catch (error) {
    toast.add({
      title: t('dashboard.education.toast.deleteError'),
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
          {{ t('dashboard.education.eyebrow') }}
        </p>
        <h2 class="mt-1 text-2xl font-extrabold tracking-tight">
          {{ t('dashboard.education.title') }}
        </h2>
        <p class="mt-1 text-sm text-neutral-500">
          {{ t('dashboard.education.intro') }}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <UButton
          :to="localePath('/educacion')"
          target="_blank"
          :label="t('dashboard.education.viewPublic')"
          icon="i-lucide-external-link"
          color="neutral"
          variant="soft"
          class="rounded-full"
        />
        <UButton
          :label="t('dashboard.education.newProgram')"
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
      :description="t('dashboard.education.missingTable')"
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

    <p
      v-if="pending"
      class="text-sm text-neutral-500"
    >
      {{ t('dashboard.education.loading') }}
    </p>

    <div
      v-else-if="!programs.length && !missingTable"
      class="rounded-2xl border border-dashed border-neutral-200 px-6 py-12 text-center dark:border-white/10"
    >
      <UIcon
        name="i-lucide-graduation-cap"
        class="mx-auto size-8 text-neutral-400"
      />
      <p class="mt-3 text-sm text-neutral-500">
        {{ t('dashboard.education.empty') }}
      </p>
    </div>

    <!-- Listado por línea -->
    <section
      v-for="group in grouped"
      :key="group.line"
      class="space-y-3"
    >
      <h3 class="text-sm font-bold uppercase tracking-[0.12em] text-neutral-400">
        {{ t(`education.lines.${group.line}.name`) }}
      </h3>

      <ul class="space-y-2">
        <li
          v-for="program in group.items"
          :key="program.id"
          class="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-white/10 dark:bg-ink-900"
        >
          <span
            class="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"
          >
            <UIcon
              :name="program.icon"
              class="size-5"
            />
          </span>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <p class="font-semibold">
                {{ titleOf(program) }}
              </p>
              <span
                v-if="!program.is_published"
                class="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/25 dark:text-amber-300 dark:ring-amber-800"
              >{{ t('dashboard.education.draft') }}</span>
            </div>
            <p class="mt-0.5 truncate text-xs text-neutral-500">
              #{{ program.position }} · {{ program.slug }} ·
              {{ program.topics.length }} {{ t('education.topicsCount', program.topics.length) }}
            </p>
          </div>

          <div class="flex shrink-0 items-center gap-1">
            <UButton
              :icon="program.is_published ? 'i-lucide-eye' : 'i-lucide-eye-off'"
              color="neutral"
              variant="ghost"
              size="xs"
              class="rounded-full"
              :aria-label="program.is_published
                ? t('dashboard.education.actions.unpublish')
                : t('dashboard.education.actions.publish')"
              @click="togglePublished(program)"
            />
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              size="xs"
              class="rounded-full"
              :aria-label="t('dashboard.education.actions.edit')"
              @click="openEdit(program)"
            />
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="xs"
              class="rounded-full"
              :aria-label="t('dashboard.education.actions.delete')"
              @click="openDelete(program)"
            />
          </div>
        </li>
      </ul>
    </section>

    <!-- Modal crear / editar -->
    <UModal
      v-model:open="formOpen"
      :title="editing ? t('dashboard.education.form.editTitle') : t('dashboard.education.form.createTitle')"
      :ui="{ content: 'max-w-2xl' }"
    >
      <template #body>
        <EducationProgramForm
          ref="formRef"
          :program="editing"
          @submit="onSubmit"
          @cancel="formOpen = false"
        />
      </template>
    </UModal>

    <!-- Modal eliminar -->
    <UModal
      v-model:open="deleteOpen"
      :title="t('dashboard.education.actions.deleteTitle')"
    >
      <template #body>
        <p class="text-sm text-neutral-600 dark:text-neutral-300">
          {{ t('dashboard.education.actions.deleteText', { title: deleting ? titleOf(deleting) : '' }) }}
        </p>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            :label="t('dashboard.education.form.cancel')"
            color="neutral"
            variant="ghost"
            class="rounded-full"
            @click="deleteOpen = false"
          />
          <UButton
            :label="t('dashboard.education.actions.confirmDelete')"
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
