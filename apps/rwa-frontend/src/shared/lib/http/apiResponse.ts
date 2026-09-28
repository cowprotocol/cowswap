import { NextResponse } from 'next/server'

import type { RwaApiError } from '@/shared/api'

export function errorResponse(status: number, error: string): NextResponse<RwaApiError> {
  return NextResponse.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } })
}

export function jsonResponse<T>(body: T, maxAgeSeconds: number): NextResponse<T> {
  return NextResponse.json(body, {
    headers: {
      'Cache-Control': `public, s-maxage=${maxAgeSeconds}, stale-while-revalidate=${maxAgeSeconds * 5}`,
    },
  })
}

export function parseEnumParam<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T | null {
  if (value === null || value === '') return fallback

  return allowed.find((item) => item === value) ?? null
}

export function parseIntegerParam(value: string | null, fallback: number, min: number, max: number): number | null {
  if (value === null || value === '') return fallback

  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed < min || parsed > max) return null

  return parsed
}
