export type RawAmount = string | number | bigint | null | undefined

// Normalize raw numeric inputs to a trimmed string or undefined (for analytics/logging).
export function normalizeRawAmount(rawAmount: RawAmount): string | undefined {
  if (rawAmount === null || rawAmount === undefined) {
    return undefined
  }

  const raw = typeof rawAmount === 'bigint' ? rawAmount.toString() : String(rawAmount)
  const trimmed = raw.trim()

  return trimmed === '' ? undefined : trimmed
}
