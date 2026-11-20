export interface AssignedPatient {
  id: string
  full_name: string | null
  email: string
  is_active: boolean
  assigned_at: string
}

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

/** Case- and accent-insensitive search by name or email. */
export function filterPatients<T extends Pick<AssignedPatient, 'full_name' | 'email'>>(patients: T[], term: string): T[] {
  const query = normalize(term.trim())

  if (!query) return patients

  return patients.filter(patient =>
    normalize(patient.email).includes(query) || normalize(patient.full_name ?? '').includes(query),
  )
}
