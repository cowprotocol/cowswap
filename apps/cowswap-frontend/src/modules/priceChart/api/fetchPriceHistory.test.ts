import { BFF_BASE_URL } from '@cowprotocol/common-const'
import { fetchWithTimeout } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { fetchPriceHistory } from './fetchPriceHistory'

import type { CandleInterval } from '../lib/chart.types'

jest.mock('@cowprotocol/common-utils', () => ({
  createCowLogger: () => ({
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  }),
  fetchWithTimeout: jest.fn(),
}))

const mockedFetchWithTimeout = jest.mocked(fetchWithTimeout)

function createResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response
}

describe('fetchPriceHistory', () => {
  beforeEach(() => {
    mockedFetchWithTimeout.mockReset()
  })

  it('fetches normalized token bars through the BFF', async () => {
    const bars = [
      {
        open: 1,
        high: 3,
        low: 0.5,
        close: 2.5,
        timestamp: 1710000000,
        volume: 123.45,
      },
    ]
    mockedFetchWithTimeout.mockResolvedValue(createResponse({ providerId: 1, bars }))

    await expect(
      fetchPriceHistory({
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        chainId: SupportedChainId.MAINNET,
        from: 1710000000,
        to: 1710007200,
        interval: '1h',
      }),
    ).resolves.toEqual(bars)

    const requestUrl = new URL(String(mockedFetchWithTimeout.mock.calls[0]?.[0]))
    expect(`${requestUrl.origin}${requestUrl.pathname}`).toBe(
      `${BFF_BASE_URL}/1/tokens/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/priceHistory`,
    )
    expect(Object.fromEntries(requestUrl.searchParams)).toEqual({
      from: '1710000000',
      to: '1710007200',
      interval: '1h',
    })
    expect(mockedFetchWithTimeout).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: { Accept: 'application/json' },
        timeout: 30_000,
      }),
    )
  })

  it('requests weekly bars with the BFF interval', async () => {
    mockedFetchWithTimeout.mockResolvedValue(createResponse({ providerId: 2, bars: [] }))

    await fetchPriceHistory({
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      chainId: SupportedChainId.MAINNET,
      from: 1710000000,
      to: 1710007200,
      interval: '7d',
    })

    const requestUrl = new URL(String(mockedFetchWithTimeout.mock.calls[0]?.[0]))
    expect(requestUrl.searchParams.get('interval')).toBe('7d')
  })

  it('rejects unsupported intervals before requesting the BFF', async () => {
    await expect(
      fetchPriceHistory({
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        chainId: SupportedChainId.MAINNET,
        from: 1710000000,
        to: 1710007200,
        interval: '30m' as CandleInterval,
      }),
    ).rejects.toThrow('Unsupported price chart interval: 30m')

    expect(mockedFetchWithTimeout).not.toHaveBeenCalled()
  })

  it('rejects unsuccessful BFF responses', async () => {
    mockedFetchWithTimeout.mockResolvedValue(createResponse({ message: 'Provider failed' }, 502))

    await expect(
      fetchPriceHistory({
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        chainId: SupportedChainId.MAINNET,
        from: 1710000000,
        to: 1710007200,
        interval: '1h',
      }),
    ).rejects.toThrow('Price chart request failed with status 502')
  })
})
