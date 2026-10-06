import { BFF_BASE_URL } from '@cowprotocol/common-const'
import { fetchWithTimeout } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { fetchPriceHistory, type PriceHistoryQuery } from './fetchPriceHistory'

import type { CandleInterval } from '../lib/chart.types'

jest.mock('@cowprotocol/common-utils', () => ({
  createCowLogger: () => ({ debug: jest.fn(), error: jest.fn(), info: jest.fn(), warn: jest.fn() }),
  fetchWithTimeout: jest.fn(),
}))

const QUERY: PriceHistoryQuery = {
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  chainId: SupportedChainId.MAINNET,
  from: 1710000000,
  to: 1710007200,
  interval: '7d',
}
const mockedFetch = jest.mocked(fetchWithTimeout)

function createResponse(body: unknown, status = 200): Response {
  return { ok: status >= 200 && status < 300, status, json: async () => body } as Response
}

describe('fetchPriceHistory', () => {
  beforeEach(() => mockedFetch.mockReset())

  it('requests the BFF history contract and returns its bars', async () => {
    const bars = [{ open: 1, high: 3, low: 0.5, close: 2.5, timestamp: QUERY.from, volume: 123.45 }]
    mockedFetch.mockResolvedValue(createResponse({ providerId: 1, bars }))

    await expect(fetchPriceHistory(QUERY)).resolves.toEqual(bars)

    const url = new URL(String(mockedFetch.mock.calls[0]?.[0]))
    expect(`${url.origin}${url.pathname}`).toBe(`${BFF_BASE_URL}/1/tokens/${QUERY.address}/priceHistory`)
    expect(Object.fromEntries(url.searchParams)).toEqual({
      from: String(QUERY.from),
      to: String(QUERY.to),
      interval: '7d',
    })
  })

  it('rejects unsupported intervals before requesting the BFF', async () => {
    await expect(fetchPriceHistory({ ...QUERY, interval: '30m' as CandleInterval })).rejects.toThrow(
      'Unsupported price chart interval: 30m',
    )
    expect(mockedFetch).not.toHaveBeenCalled()
  })

  it('rejects unsuccessful BFF responses', async () => {
    mockedFetch.mockResolvedValue(createResponse({ message: 'Provider failed' }, 502))

    await expect(fetchPriceHistory(QUERY)).rejects.toThrow('Price chart request failed with status 502')
  })
})
