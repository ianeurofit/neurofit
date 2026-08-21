import type { RoadmapNode, RoadmapNodeInput } from '~/types/roadmap'

/** Código de Postgres cuando la tabla todavía no existe. */
const UNDEFINED_TABLE = '42P01'

/**
 * Nodos del Road Map. La escritura la autoriza RLS (solo superusuario),
 * así que aquí no se replica esa comprobación: el cliente solo refleja
 * lo que la base de datos permite.
 */
export function useRoadmap() {
  const client = useSupabaseClient()

  const nodes = useState<RoadmapNode[]>('roadmap-nodes', () => [])
  const pending = ref(false)
  /** True cuando falta correr la migración: permite avisar en vez de romper. */
  const missingTable = ref(false)
  const errorMessage = ref('')

  async function fetchNodes() {
    pending.value = true
    errorMessage.value = ''

    const { data, error } = await client
      .from('roadmap_nodes')
      .select('*')
      .order('event_date', { ascending: true })
      .order('position', { ascending: true })

    pending.value = false

    if (error) {
      missingTable.value = error.code === UNDEFINED_TABLE
      if (!missingTable.value) errorMessage.value = error.message
      nodes.value = []
      return
    }

    missingTable.value = false
    nodes.value = (data ?? []) as RoadmapNode[]
  }

  async function createNode(input: RoadmapNodeInput) {
    const { data, error } = await client
      .from('roadmap_nodes')
      .insert(input)
      .select()
      .single()

    if (error) throw new Error(error.message)

    nodes.value = [...nodes.value, data as RoadmapNode]
    sortNodes()
    return data as RoadmapNode
  }

  async function updateNode(id: string, input: Partial<RoadmapNodeInput>) {
    const { data, error } = await client
      .from('roadmap_nodes')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)

    nodes.value = nodes.value.map(node => (node.id === id ? (data as RoadmapNode) : node))
    sortNodes()
    return data as RoadmapNode
  }

  async function deleteNode(id: string) {
    const { error } = await client
      .from('roadmap_nodes')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)

    nodes.value = nodes.value.filter(node => node.id !== id)
  }

  function sortNodes() {
    nodes.value = [...nodes.value].sort(
      (a, b) => a.event_date.localeCompare(b.event_date) || a.position - b.position,
    )
  }

  return {
    nodes,
    pending,
    missingTable,
    errorMessage,
    fetchNodes,
    createNode,
    updateNode,
    deleteNode,
  }
}
