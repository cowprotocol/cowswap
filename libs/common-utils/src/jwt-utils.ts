import { isRecord, JsonRecord, readNumberField } from './json-utils'

export function decodeJwtPayload(token: string): JsonRecord | null {
  const [, payload] = token.split('.')

  if (!payload) return null

  try {
    const decodedPayload = JSON.parse(globalThis.atob(normalizeBase64Url(payload))) as unknown

    return isRecord(decodedPayload) ? decodedPayload : null
  } catch {
    return null
  }
}

export function getJwtExpiresAt(token: string): string | null {
  const expiresAt = readNumberField(decodeJwtPayload(token), 'exp')

  return expiresAt === undefined ? null : new Date(expiresAt * 1000).toISOString()
}

export function getJwtTtl(expiresAt: string): number {
  const expiresAtMs = Date.parse(expiresAt)

  return Number.isNaN(expiresAtMs) ? 0 : Math.max(0, expiresAtMs - Date.now())
}

export function isJwtExpired(expiresAt: string): boolean {
  const expiresAtMs = Date.parse(expiresAt)

  return Number.isNaN(expiresAtMs) || expiresAtMs <= Date.now()
}

function normalizeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const paddingLength = (4 - (normalized.length % 4)) % 4

  return normalized + '='.repeat(paddingLength)
}
