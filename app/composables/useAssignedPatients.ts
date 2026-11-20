/** Patients assigned to the signed-in evaluator, with the search used by the list. */
export function useAssignedPatients() {
  const search = ref('')

  const { data, status, refresh } = useFetch<{ patients: AssignedPatient[] }>('/api/evaluator/patients', {
    key: 'assigned-patients',
    default: () => ({ patients: [] }),
  })

  const patients = computed(() => data.value?.patients ?? [])
  const filtered = computed(() => filterPatients(patients.value, search.value))
  const pending = computed(() => status.value === 'pending')
  const hasError = computed(() => status.value === 'error')

  return { search, patients, filtered, pending, hasError, refresh }
}
