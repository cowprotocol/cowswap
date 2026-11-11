/** Minimum number of single-char insertions, deletions and substitutions turning `a` into `b` */
export function getLevenshteinDistance(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length

  let previous = Array.from({ length: b.length + 1 }, (_, index) => index)

  for (let i = 1; i <= a.length; i++) {
    const current = [i]

    for (let j = 1; j <= b.length; j++) {
      const substitution = previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)

      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, substitution)
    }

    previous = current
  }

  return previous[b.length]
}
