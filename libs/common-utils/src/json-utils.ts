export type JsonRecord = Record<string, unknown>

export function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null
}

export function readNumberField<T extends object>(value: T | undefined | null, key: keyof T): number | undefined {
  if (!value) return undefined

  const raw = value[key]

  return typeof raw === 'number' ? raw : undefined
}

export function readStringField<T extends object>(value: T | undefined | null, key: keyof T): string | undefined {
  if (!value) return undefined

  const raw = value[key]

  return typeof raw === 'string' ? raw : undefined
}
