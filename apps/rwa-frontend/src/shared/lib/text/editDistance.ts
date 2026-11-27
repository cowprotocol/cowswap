/**
 * Minimum number of single-char insertions, deletions, substitutions and swaps of adjacent chars turning `a` into `b`
 * (optimal string alignment: a substring is edited at most once)
 */
export function getEditDistance(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length

  let beforePrevious: number[] = []
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index)

  for (let i = 1; i <= a.length; i++) {
    const current = [i]

    for (let j = 1; j <= b.length; j++) {
      const substitution = previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      const swap = isAdjacentSwap(a, b, i, j) ? beforePrevious[j - 2] + 1 : Infinity

      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, substitution, swap)
    }

    beforePrevious = previous
    previous = current
  }

  return previous[b.length]
}

function isAdjacentSwap(a: string, b: string, i: number, j: number): boolean {
  return i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]
}
