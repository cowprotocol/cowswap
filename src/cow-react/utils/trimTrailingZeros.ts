const DOT = '.'
const ZERO = '0'

export function trimTrailingZeros(value: string): string {
  if (!value.includes(DOT)) return value

  const trimmed = value.slice(0, getFirstTrailingZeroIndex(value))

  if (trimmed[trimmed.length - 1] === DOT) return trimmed.slice(0, -1)

  return trimmed
}

function getFirstTrailingZeroIndex(value: string): number {
  for (let i = value.length - 1; i > 0; i--) {
    if (value[i] !== ZERO) return i + 1
  }

  return value.length
}
