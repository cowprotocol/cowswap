/**
 * @jest-environment node
 */
import { getRetryDelayMs, RetryBackoffError, withRetryBackoff } from './retryBackoff'

const MINUTE_MS = 60_000

describe('getRetryDelayMs', () => {
  it('waits 60s after the first failure and doubles the delay after each next one', () => {
    expect([1, 2, 3, 4].map(getRetryDelayMs)).toEqual([MINUTE_MS, 2 * MINUTE_MS, 4 * MINUTE_MS, 8 * MINUTE_MS])
  })

  it('caps the delay at an hour', () => {
    expect(getRetryDelayMs(7)).toBe(60 * MINUTE_MS)
    expect(getRetryDelayMs(50)).toBe(60 * MINUTE_MS)
  })
})

describe('withRetryBackoff', () => {
  let now = 0

  beforeEach(() => {
    now = 1_790_000_000_000
    jest.spyOn(Date, 'now').mockImplementation(() => now)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns the result of load', async () => {
    await expect(withRetryBackoff('ok', () => Promise.resolve(1))).resolves.toBe(1)
  })

  it('skips load until the delay of the failure count has passed', async () => {
    const load = jest.fn().mockRejectedValue(new Error('429'))

    await expect(withRetryBackoff('progressive', load)).rejects.toThrow('429')

    for (const delay of [MINUTE_MS, 2 * MINUTE_MS, 4 * MINUTE_MS]) {
      now += delay - 1
      await expect(withRetryBackoff('progressive', load)).rejects.toThrow(RetryBackoffError)

      now += 1
      await expect(withRetryBackoff('progressive', load)).rejects.toThrow('429')
    }

    expect(load).toHaveBeenCalledTimes(4)
  })

  it('resets the delay after a success', async () => {
    const load = jest
      .fn()
      .mockRejectedValueOnce(new Error('429'))
      .mockRejectedValueOnce(new Error('429'))
      .mockResolvedValueOnce('ok')
      .mockRejectedValueOnce(new Error('429'))
      .mockResolvedValueOnce('ok again')

    await expect(withRetryBackoff('reset', load)).rejects.toThrow('429')
    now += MINUTE_MS
    await expect(withRetryBackoff('reset', load)).rejects.toThrow('429')
    now += 2 * MINUTE_MS
    await expect(withRetryBackoff('reset', load)).resolves.toBe('ok')
    await expect(withRetryBackoff('reset', load)).rejects.toThrow('429')
    now += MINUTE_MS
    await expect(withRetryBackoff('reset', load)).resolves.toBe('ok again')
  })

  it('shares one load between concurrent calls with the same key', async () => {
    let resolveLoad: (value: string) => void = () => undefined
    const load = jest.fn(() => new Promise<string>((resolve) => (resolveLoad = resolve)))

    const first = withRetryBackoff('concurrent', load)
    const second = withRetryBackoff('concurrent', load)
    resolveLoad('ok')

    await expect(Promise.all([first, second])).resolves.toEqual(['ok', 'ok'])
    expect(load).toHaveBeenCalledTimes(1)

    load.mockResolvedValueOnce('again')

    await expect(withRetryBackoff('concurrent', load)).resolves.toBe('again')
    expect(load).toHaveBeenCalledTimes(2)
  })

  it('counts a shared failure once', async () => {
    let rejectLoad: (error: Error) => void = () => undefined
    const load = jest.fn(() => new Promise<string>((_, reject) => (rejectLoad = reject)))

    const calls = [withRetryBackoff('shared-failure', load), withRetryBackoff('shared-failure', load)]
    rejectLoad(new Error('timeout'))

    await expect(Promise.all(calls)).rejects.toThrow('timeout')

    now += MINUTE_MS
    load.mockResolvedValueOnce('ok')

    await expect(withRetryBackoff('shared-failure', load)).resolves.toBe('ok')
  })

  it('tracks every key separately', async () => {
    await expect(withRetryBackoff('failing', () => Promise.reject(new Error('500')))).rejects.toThrow('500')

    await expect(withRetryBackoff('other', () => Promise.resolve('ok'))).resolves.toBe('ok')
  })
})
