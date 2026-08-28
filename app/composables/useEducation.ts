import type { EducationProgram, EducationProgramInput } from '~/types/education'

/** Código de Postgres cuando la tabla todavía no existe. */
const UNDEFINED_TABLE = '42P01'

/**
 * Catálogo de conferencias, talleres y programas. La lectura es pública y la
 * escritura la autoriza RLS (solo superusuario), así que aquí no se replica
 * esa comprobación: el cliente solo refleja lo que la base de datos permite.
 */
export function useEducation() {
  const client = useSupabaseClient()

  const programs = useState<EducationProgram[]>('education-programs', () => [])
  const pending = ref(false)
  /** True cuando falta correr la migración: permite avisar en vez de romper. */
  const missingTable = ref(false)
  const errorMessage = ref('')

  /** Devuelve la lista para que `useAsyncData` reciba un valor, no `undefined`. */
  async function fetchPrograms() {
    pending.value = true
    errorMessage.value = ''

    const { data, error } = await client
      .from('education_programs')
      .select('*')
      .order('line', { ascending: true })
      .order('position', { ascending: true })

    pending.value = false

    if (error) {
      missingTable.value = error.code === UNDEFINED_TABLE
      if (!missingTable.value) errorMessage.value = error.message
      programs.value = []
      return programs.value
    }

    missingTable.value = false
    programs.value = (data ?? []) as EducationProgram[]
    return programs.value
  }

  async function createProgram(input: EducationProgramInput) {
    const { data, error } = await client
      .from('education_programs')
      .insert(input)
      .select()
      .single()

    if (error) throw new Error(error.message)

    programs.value = sorted([...programs.value, data as EducationProgram])
    return data as EducationProgram
  }

  async function updateProgram(id: string, input: Partial<EducationProgramInput>) {
    const { data, error } = await client
      .from('education_programs')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)

    programs.value = sorted(
      programs.value.map(p => (p.id === id ? (data as EducationProgram) : p)),
    )
    return data as EducationProgram
  }

  async function deleteProgram(id: string) {
    const { error } = await client
      .from('education_programs')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)

    programs.value = programs.value.filter(p => p.id !== id)
  }

  function sorted(list: EducationProgram[]) {
    return [...list].sort(
      (a, b) => a.line.localeCompare(b.line) || a.position - b.position,
    )
  }

  return {
    programs,
    pending,
    missingTable,
    errorMessage,
    fetchPrograms,
    createProgram,
    updateProgram,
    deleteProgram,
  }
}
