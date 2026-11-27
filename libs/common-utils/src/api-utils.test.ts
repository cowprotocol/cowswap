import { parseRetryAfter } from './api-utils'

const withRetryAfter = (value?: string): Pick<Response, 'headers'> => ({
  headers: new Headers(value === undefined ? {} : { 'Retry-After': value }),
})

describe('parseRetryAfter', () => {
  it('reads seconds or an HTTP date, and falls back to 60s', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-26T10:00:00Z'))

    expect(parseRetryAfter(withRetryAfter('30'))).toBe(30_000)
    expect(parseRetryAfter(withRetryAfter('Thu, 26 Nov 2026 10:02:00 GMT'))).toBe(120_000)
    expect(parseRetryAfter(withRetryAfter())).toBe(60_000)
    expect(parseRetryAfter(withRetryAfter('soon'))).toBe(60_000)

    jest.useRealTimers()
  })
})
