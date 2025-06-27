export function areSetsEqual<T>(a: Set<T>, b: Set<T>): boolean {
  if (a.size !== b.size) return false

  for (const item of a) {
    if (!b.has(item)) return false
  }

  return true
}
