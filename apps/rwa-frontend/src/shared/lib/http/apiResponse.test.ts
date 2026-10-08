/**
 * @jest-environment node
 */
import { errorResponse, jsonResponse, parseEnumParam, parseIntegerParam } from './apiResponse'

describe('jsonResponse', () => {
  it('sets shared cache headers for a complete response', () => {
    const response = jsonResponse({ items: [], degraded: false }, 60)

    expect(response.headers.get('Cache-Control')).toBe('public, s-maxage=60, stale-while-revalidate=300')
  })

  it('disables caching for a degraded response', () => {
    const response = jsonResponse({ items: [], degraded: true }, 60)

    expect(response.headers.get('Cache-Control')).toBe('no-store')
  })

  it('caches bodies without the degraded flag', () => {
    const response = jsonResponse({ points: [] }, 300)

    expect(response.headers.get('Cache-Control')).toBe('public, s-maxage=300, stale-while-revalidate=1500')
  })
})

describe('errorResponse', () => {
  it('returns the status and is never cached', async () => {
    const response = errorResponse(404, 'Not found')

    expect(response.status).toBe(404)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(await response.json()).toEqual({ error: 'Not found' })
  })
})

describe('parseIntegerParam', () => {
  it('returns the fallback for a missing value', () => {
    expect(parseIntegerParam(null, 20, 1, 100)).toBe(20)
    expect(parseIntegerParam('', 20, 1, 100)).toBe(20)
  })

  it('rejects out of range and non-integer values', () => {
    expect(parseIntegerParam('0', 20, 1, 100)).toBeNull()
    expect(parseIntegerParam('101', 20, 1, 100)).toBeNull()
    expect(parseIntegerParam('1.5', 20, 1, 100)).toBeNull()
    expect(parseIntegerParam('abc', 20, 1, 100)).toBeNull()
  })

  it('parses a valid value', () => {
    expect(parseIntegerParam('42', 20, 1, 100)).toBe(42)
  })
})

describe('parseEnumParam', () => {
  const values = ['asc', 'desc'] as const

  it('returns the fallback for a missing value', () => {
    expect(parseEnumParam(null, values, 'desc')).toBe('desc')
  })

  it('returns the matching value or null', () => {
    expect(parseEnumParam('asc', values, 'desc')).toBe('asc')
    expect(parseEnumParam('up', values, 'desc')).toBeNull()
  })
})
