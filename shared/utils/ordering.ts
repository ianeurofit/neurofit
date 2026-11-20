/** Position for an item appended at the end: 1 for an empty list, max + 1 otherwise. */
export function nextPosition(items: { position: number }[]): number {
  return items.reduce((max, item) => Math.max(max, item.position), 0) + 1
}

function isIndex(value: number, length: number) {
  return Number.isInteger(value) && value >= 0 && value < length
}

/**
 * Moves the item at `from` to `to` (indexes in position order) and renumbers 1..n.
 * An index out of range returns the list unchanged.
 */
export function reorder<T extends { position: number }>(items: T[], from: number, to: number): T[] {
  if (!isIndex(from, items.length) || !isIndex(to, items.length)) return items

  const sorted = [...items].sort((a, b) => a.position - b.position)
  const [moved] = sorted.splice(from, 1)
  sorted.splice(to, 0, moved!)

  return sorted.map((item, index) => ({ ...item, position: index + 1 }))
}

/** One step up or down, as the mobile buttons do. */
export function moveItem<T extends { position: number }>(items: T[], index: number, direction: 'up' | 'down'): T[] {
  return reorder(items, index, direction === 'up' ? index - 1 : index + 1)
}
