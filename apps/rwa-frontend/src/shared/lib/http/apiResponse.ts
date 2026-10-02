import 'server-only'

import { NextResponse } from 'next/server'

import { isDegradedResponse, type RwaApiError } from '@/shared/api'

export function errorResponse(status: number, error: string): NextResponse<RwaApiError> {
  return NextResponse.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } })
}

/**
 * Degraded bodies (see `DegradableResponse`) are never cached, so an upstream outage doesn't outlive itself.
 * `staleWhileRevalidateSeconds` defaults to 5 × `maxAgeSeconds`, `0` disables it.
 */
export function jsonResponse<T>(
  body: T,
  maxAgeSeconds: number,
  staleWhileRevalidateSeconds = maxAgeSeconds * 5,
): NextResponse<T> {
  const staleWhileRevalidate =
    staleWhileRevalidateSeconds > 0 ? `, stale-while-revalidate=${staleWhileRevalidateSeconds}` : ''
  const cacheControl = isDegradedResponse(body)
    ? 'no-store'
    : `public, s-maxage=${maxAgeSeconds}${staleWhileRevalidate}`

  return NextResponse.json(body, { headers: { 'Cache-Control': cacheControl } })
}

export function parseEnumParam<T extends string, F extends T | undefined = T>(
  value: string | null,
  allowed: readonly T[],
  fallback: F,
): T | F | null {
  if (value === null || value === '') return fallback

  return allowed.find((item) => item === value) ?? null
}

export function parseIntegerParam<F extends number | undefined = number>(
  value: string | null,
  fallback: F,
  min: number,
  max: number,
): number | F | null {
  if (value === null || value === '') return fallback

  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed < min || parsed > max) return null

  return parsed
}
