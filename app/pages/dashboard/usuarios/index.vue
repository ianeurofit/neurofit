<script setup lang="ts">
import { ROLE_COLORS, USER_ROLES, type Profile, type UserRole } from '~/types/user'

definePageMeta({ layout: 'dashboard', titleKey: 'dashboard.titles.users' })

const { t, locale } = useI18n()
const localePath = useLocalePath()

useSeoMeta({ title: () => t('seo.users.title'), robots: 'noindex' })

const client = useSupabaseClient()
const toast = useToast()
const { profile: me } = useProfile()

const { data: users, pending, refresh } = await useAsyncData('admin-profiles', async () => {
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Profile[]
})

const search = ref('')
const roleFilter = ref<UserRole | 'all'>('all')

const roleItems = computed(() =>
  USER_ROLES.map(role => ({ value: role, label: t(`roles.${role}.label`) })),
)

const roleFilterItems = computed(() => [
  { value: 'all', label: t('dashboard.users.allRoles') },
  ...roleItems.value,
])

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  return (users.value ?? []).filter((u) => {
    const matchesRole = roleFilter.value === 'all' || u.role === roleFilter.value
    const matchesTerm = !term
      || u.email.toLowerCase().includes(term)
      || (u.full_name ?? '').toLowerCase().includes(term)
    return matchesRole && matchesTerm
  })
})

/* ---------- Edición ---------- */
const editOpen = ref(false)
const editing = ref<Profile | null>(null)
const editState = reactive({ full_name: '', role: 'user' as UserRole, is_active: true, password: '' })
const savingEdit = ref(false)

function openEdit(user: Profile) {
  editing.value = user
  editState.full_name = user.full_name ?? ''
  editState.role = user.role
  editState.is_active = user.is_active
  editState.password = ''
  editOpen.value = true
}

async function saveEdit() {
  if (!editing.value) return
  savingEdit.value = true

  try {
    await $fetch(`/api/admin/users/${editing.value.id}`, {
      method: 'PATCH',
      body: {
        full_name: editState.full_name,
        role: editState.role,
        is_active: editState.is_active,
        ...(editState.password ? { password: editState.password } : {}),
      },
    })
    toast.add({ title: t('dashboard.users.updated'), color: 'primary' })
    editOpen.value = false
    await refresh()
  }
  catch (error: unknown) {
    toast.add({
      title: t('dashboard.users.updateError'),
      description: errorMessage(error),
      color: 'error',
    })
  }
  finally {
    savingEdit.value = false
  }
}

/* ---------- Eliminación ---------- */
const deleteOpen = ref(false)
const deleting = ref<Profile | null>(null)
const removing = ref(false)

function openDelete(user: Profile) {
  deleting.value = user
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!deleting.value) return
  removing.value = true

  try {
    await $fetch(`/api/admin/users/${deleting.value.id}`, { method: 'DELETE' })
    toast.add({ title: t('dashboard.users.deleted'), color: 'primary' })
    deleteOpen.value = false
    await refresh()
  }
  catch (error: unknown) {
    toast.add({ title: t('dashboard.users.deleteError'), description: errorMessage(error), color: 'error' })
  }
  finally {
    removing.value = false
  }
}

function errorMessage(error: unknown) {
  const e = error as { statusMessage?: string, data?: { statusMessage?: string }, message?: string }
  return e?.data?.statusMessage ?? e?.statusMessage ?? e?.message ?? t('dashboard.users.unknownError')
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(locale.value === 'en' ? 'en-US' : 'es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 class="text-2xl font-extrabold tracking-tight">
          {{ t('dashboard.users.title') }}
        </h2>
        <p class="mt-1 text-sm text-neutral-500">
          {{ t('dashboard.users.intro') }}
        </p>
      </div>
      <UButton
        :to="localePath('/dashboard/usuarios/nuevo')"
        :label="t('dashboard.users.create')"
        icon="i-lucide-user-plus"
        color="primary"
        class="rounded-full"
      />
    </div>

    <div class="flex flex-wrap gap-3">
      <UInput
        v-model="search"
        icon="i-lucide-search"
        :placeholder="t('dashboard.users.search')"
        class="w-full sm:w-80"
      />
      <USelectMenu
        v-model="roleFilter"
        :items="roleFilterItems"
        value-key="value"
        class="w-full sm:w-52"
      />
    </div>

    <div class="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-ink-900">
      <div
        v-if="pending"
        class="px-6 py-10 text-sm text-neutral-500"
      >
        {{ t('dashboard.users.loading') }}
      </div>

      <div
        v-else-if="!filtered.length"
        class="px-6 py-10 text-center"
      >
        <UIcon
          name="i-lucide-users"
          class="mx-auto size-8 text-neutral-400"
        />
        <p class="mt-3 text-sm text-neutral-500">
          {{ t('dashboard.users.empty') }}
        </p>
      </div>

      <div
        v-else
        class="overflow-x-auto"
      >
        <table class="w-full min-w-[720px] text-left text-sm">
          <thead class="border-b border-neutral-200 bg-neutral-50 text-xs font-bold uppercase tracking-[0.1em] text-neutral-500 dark:border-white/10 dark:bg-white/5">
            <tr>
              <th class="px-6 py-3">
                {{ t('dashboard.users.columns.user') }}
              </th>
              <th class="px-6 py-3">
                {{ t('dashboard.users.columns.role') }}
              </th>
              <th class="px-6 py-3">
                {{ t('dashboard.users.columns.status') }}
              </th>
              <th class="px-6 py-3">
                {{ t('dashboard.users.columns.created') }}
              </th>
              <th class="px-6 py-3 text-right">
                {{ t('dashboard.users.columns.actions') }}
              </th>
            </tr>
          </thead>
          <tbody
            v-auto-animate
            class="divide-y divide-neutral-200 dark:divide-white/10"
          >
            <tr
              v-for="user in filtered"
              :key="user.id"
              class="transition-colors hover:bg-neutral-50 dark:hover:bg-white/5"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                    {{ (user.full_name || user.email).slice(0, 2).toUpperCase() }}
                  </div>
                  <div class="min-w-0">
                    <p class="truncate font-semibold">
                      {{ user.full_name || t('dashboard.noName') }}
                      <span
                        v-if="user.id === me?.id"
                        class="ml-1 text-xs font-normal text-neutral-400"
                      >{{ t('dashboard.users.you') }}</span>
                    </p>
                    <p class="truncate text-xs text-neutral-500">
                      {{ user.email }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <UBadge
                  :color="ROLE_COLORS[user.role]"
                  variant="soft"
                  class="rounded-full"
                  :label="t(`roles.${user.role}.label`)"
                />
              </td>
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center gap-1.5 text-xs font-semibold"
                  :class="user.is_active ? 'text-brand-600 dark:text-brand-400' : 'text-neutral-400'"
                >
                  <span
                    class="size-2 rounded-full"
                    :class="user.is_active ? 'bg-brand-500' : 'bg-neutral-400'"
                  />
                  {{ user.is_active ? t('dashboard.users.active') : t('dashboard.users.inactive') }}
                </span>
              </td>
              <td class="px-6 py-4 text-xs text-neutral-500">
                {{ formatDate(user.created_at) }}
              </td>
              <td class="px-6 py-4">
                <div class="flex justify-end gap-1">
                  <UButton
                    icon="i-lucide-pencil"
                    color="neutral"
                    variant="ghost"
                    :aria-label="t('dashboard.users.editAria')"
                    @click="openEdit(user)"
                  />
                  <UButton
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="ghost"
                    :disabled="user.id === me?.id"
                    :aria-label="t('dashboard.users.deleteAria')"
                    @click="openDelete(user)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal editar -->
    <UModal
      v-model:open="editOpen"
      :title="t('dashboard.users.editTitle', { email: editing?.email ?? '' })"
    >
      <template #body>
        <div class="space-y-5">
          <UFormField :label="t('dashboard.users.fullName')">
            <UInput
              v-model="editState.full_name"
              size="lg"
              icon="i-lucide-user"
              class="w-full"
            />
          </UFormField>

          <UFormField
            :label="t('dashboard.users.role')"
            :help="editing?.id === me?.id ? t('dashboard.users.roleSelfHelp') : undefined"
          >
            <USelectMenu
              v-model="editState.role"
              :items="roleItems"
              value-key="value"
              :disabled="editing?.id === me?.id"
              class="w-full"
            />
          </UFormField>

          <UFormField
            :label="t('dashboard.users.newPassword')"
            :help="t('dashboard.users.newPasswordHelp')"
          >
            <UInput
              v-model="editState.password"
              type="password"
              size="lg"
              icon="i-lucide-lock"
              placeholder="••••••••"
              class="w-full"
            />
          </UFormField>

          <div class="flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3 dark:bg-white/5">
            <div>
              <p class="text-sm font-semibold">
                {{ t('dashboard.users.activeAccount') }}
              </p>
              <p class="text-xs text-neutral-500">
                {{ t('dashboard.users.activeAccountHelp') }}
              </p>
            </div>
            <USwitch
              v-model="editState.is_active"
              :disabled="editing?.id === me?.id"
            />
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            :label="t('dashboard.users.cancel')"
            color="neutral"
            variant="ghost"
            class="rounded-full"
            @click="editOpen = false"
          />
          <UButton
            :label="t('dashboard.users.save')"
            color="primary"
            class="rounded-full"
            :loading="savingEdit"
            @click="saveEdit"
          />
        </div>
      </template>
    </UModal>

    <!-- Modal eliminar -->
    <UModal
      v-model:open="deleteOpen"
      :title="t('dashboard.users.deleteTitle')"
    >
      <template #body>
        <i18n-t
          keypath="dashboard.users.deleteText"
          tag="p"
          class="text-sm text-neutral-600 dark:text-neutral-300"
        >
          <template #email>
            <strong>{{ deleting?.email }}</strong>
          </template>
        </i18n-t>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            :label="t('dashboard.users.cancel')"
            color="neutral"
            variant="ghost"
            class="rounded-full"
            @click="deleteOpen = false"
          />
          <UButton
            :label="t('dashboard.users.delete')"
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
