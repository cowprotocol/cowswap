/**
 * @jest-environment node
 */
import { fetchXStocksActivation } from './xstocksClient'

jest.mock('next/cache', () => ({
  unstable_cache: <T extends unknown[], R>(load: (...args: T) => Promise<R>) => load,
}))

function jsonResponse(body: unknown, status = 200): Partial<Response> {
  return { ok: status < 400, status, json: () => Promise.resolve(body) }
}

describe('fetchXStocksActivation', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('takes the pending activation without reading the history', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(jsonResponse({ newMultiplier: 1.01, activationDateTime: '2026-10-28T00:30:00.000Z' }))
    global.fetch = fetchMock

    await expect(fetchXStocksActivation('NVDAx', 1)).resolves.toBe(Date.parse('2026-10-28T00:30:00.000Z'))
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      'https://api.xstocks.fi/api/v2/public/assets/NVDAx/multiplier?network=Ethereum',
    )
  })

  it('falls back to the last activation once none is pending', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({ newMultiplier: 0, activationDateTime: 0 }))
      .mockResolvedValueOnce(
        jsonResponse({
          nodes: [
            { activationDateTime: '2026-06-04T00:30:00.000Z' },
            { activationDateTime: '2026-10-28T00:30:00.000Z' },
          ],
        }),
      )
    global.fetch = fetchMock

    await expect(fetchXStocksActivation('TSLAx', 42161)).resolves.toBe(Date.parse('2026-10-28T00:30:00.000Z'))
    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      'https://api.xstocks.fi/api/v2/public/assets/TSLAx/multiplier/history?network=Arbitrum',
    )
  })

  it('is null for an unknown asset, an asset without history, or a network xStocks is not on', async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({}, 404))
    await expect(fetchXStocksActivation('UNKNOWNx', 1)).resolves.toBeNull()

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({ newMultiplier: 0, activationDateTime: 0 }))
      .mockResolvedValueOnce(jsonResponse({ nodes: [] }))
    await expect(fetchXStocksActivation('NEWx', 1)).resolves.toBeNull()

    global.fetch = jest.fn()
    await expect(fetchXStocksActivation('NVDAx', 11155111)).resolves.toBeNull()
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
